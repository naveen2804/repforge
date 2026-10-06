// One-off Supabase -> Firebase migration.
//
//   node scripts/migrate-from-supabase.mjs <service-account.json> <supabase_export.json> [--rules-only] [--dry-run]
//
// The export comes from scripts/supabase-export.sql. Accounts keep their Supabase uid and
// bcrypt password hash, so everyone signs in with the same username and password and their
// data lands under the same users/{uid} it belongs to. Also publishes firestore.rules.
// Safe to re-run: user import overwrites by uid and every document write is a set().
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getSecurityRules } from 'firebase-admin/security-rules'

const [keyPath, exportPath] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const rulesOnly = process.argv.includes('--rules-only')
const dryRun = process.argv.includes('--dry-run')
if (!keyPath || (!exportPath && !rulesOnly)) {
  console.error('usage: node scripts/migrate-from-supabase.mjs <service-account.json> <supabase_export.json> [--rules-only] [--dry-run]')
  process.exit(1)
}

// Throwaway accounts from the original end-to-end test; nothing worth carrying over.
const SKIP_USERNAME = /^zzq[ab]_/

const app = initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) })

const rulesSource = readFileSync(fileURLToPath(new URL('../firestore.rules', import.meta.url)), 'utf8')
if (dryRun) console.log('[dry run] would publish firestore.rules')
else {
  await getSecurityRules(app).releaseFirestoreRulesetFromSource(rulesSource)
  console.log('Published firestore.rules')
}
if (rulesOnly) process.exit(0)

const data = JSON.parse(readFileSync(exportPath, 'utf8'))
const iso = (t) => (t ? new Date(t).toISOString() : null)

const profiles = new Map(data.profiles.map((p) => [p.id, p]))
const users = data.users.filter((u) => !SKIP_USERNAME.test(profiles.get(u.id)?.username ?? u.email))
console.log(`Importing ${users.length} of ${data.users.length} accounts: ${users.map((u) => u.email.split('@')[0]).join(', ')}`)

if (!dryRun) {
  const result = await getAuth(app).importUsers(
    users.map((u) => ({
      uid: u.id,
      email: u.email,
      emailVerified: false,
      passwordHash: Buffer.from(u.password_hash),
      metadata: {
        creationTime: new Date(u.created_at).toUTCString(),
        lastSignInTime: u.last_sign_in_at ? new Date(u.last_sign_in_at).toUTCString() : undefined,
      },
    })),
    { hash: { algorithm: 'BCRYPT' } },
  )
  for (const e of result.errors) console.error(`  account ${users[e.index].email}: ${e.error.message}`)
  if (result.errors.length) process.exit(1)
}

// Rebuild nested session documents from the three flat tables.
const setsByExercise = Map.groupBy(data.sets, (s) => s.session_exercise_id)
const exercisesBySession = Map.groupBy(data.session_exercises, (e) => e.session_id)
const favoritesByUser = Map.groupBy(data.favorites, (f) => f.user_id)
const keep = new Set(users.map((u) => u.id))

const db = getFirestore(app)
const writer = db.bulkWriter()
let docs = 0
const write = (ref, value) => {
  docs += 1
  if (!dryRun) void writer.set(ref, value)
}

for (const u of users) {
  const p = profiles.get(u.id)
  write(db.doc(`users/${u.id}`), {
    username: p?.username ?? u.email.split('@')[0],
    unit: p?.unit ?? 'kg',
    favorites: (favoritesByUser.get(u.id) ?? []).map((f) => f.exercise_id),
    created_at: iso(p?.created_at ?? u.created_at),
  })
}

for (const s of data.workout_sessions) {
  if (!keep.has(s.user_id)) continue
  write(db.doc(`users/${s.user_id}/sessions/${s.id}`), {
    started_at: iso(s.started_at),
    ended_at: iso(s.ended_at),
    name: s.name,
    template_key: s.template_key,
    notes: s.notes,
    session_exercises: (exercisesBySession.get(s.id) ?? []).map((e) => ({
      id: e.id,
      session_id: s.id,
      exercise_id: e.exercise_id,
      order_index: e.order_index,
      notes: e.notes,
      sets: (setsByExercise.get(e.id) ?? []).map((set) => ({
        id: set.id,
        session_exercise_id: e.id,
        set_number: set.set_number,
        reps: set.reps,
        weight_kg: set.weight_kg == null ? null : Number(set.weight_kg),
        duration_seconds: set.duration_seconds,
        rpe: set.rpe == null ? null : Number(set.rpe),
        completed: set.completed,
      })),
    })),
  })
}

for (const t of data.custom_templates) {
  if (!keep.has(t.user_id)) continue
  write(db.doc(`users/${t.user_id}/templates/${t.id}`), {
    name: t.name,
    exercise_ids: t.exercise_ids,
    created_at: iso(t.created_at),
  })
}

await writer.close()
console.log(`${dryRun ? '[dry run] would write' : 'Wrote'} ${docs} documents`)
