#!/usr/bin/env node
/**
 * Builds the static exercise catalogue that ships with the app.
 *
 *   node scripts/build-exercise-data.mjs [path-to-free-exercise-db-checkout]
 *
 * Source: https://github.com/yuhonas/free-exercise-db (public domain).
 * Without an argument the script shallow-clones the dataset into a temp folder.
 *
 * Output (committed to the repo so CI never has to redo this work):
 *   public/exercises.json   slimmed + re-tagged catalogue
 *   public/ex/<id>/<n>.webp 420px WebP renditions of the demo photos (~18 MB total)
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outJson = path.join(root, 'public', 'exercises.json')
const outImages = path.join(root, 'public', 'ex')

/** Dataset muscle names -> the body parts the UI filters by. */
const BODY_PART_BY_MUSCLE = {
  chest: 'chest',
  lats: 'back',
  'middle back': 'back',
  'lower back': 'back',
  traps: 'back',
  shoulders: 'shoulders',
  neck: 'shoulders',
  biceps: 'biceps',
  triceps: 'triceps',
  forearms: 'forearms',
  abdominals: 'core',
  quadriceps: 'quads',
  hamstrings: 'hamstrings',
  glutes: 'glutes',
  abductors: 'glutes',
  adductors: 'glutes',
  calves: 'calves',
}

/** Dataset equipment names -> the equipment the UI filters by. */
const EQUIPMENT_MAP = {
  'body only': 'bodyweight',
  barbell: 'barbell',
  'e-z curl bar': 'barbell',
  dumbbell: 'dumbbell',
  machine: 'machine',
  cable: 'cable',
  kettlebells: 'kettlebell',
  bands: 'bands',
  'medicine ball': 'medicine ball',
  'exercise ball': 'exercise ball',
  'foam roll': 'foam roll',
  other: 'other',
}

function resolveSource(arg) {
  if (arg) return path.resolve(arg)
  const dir = path.join(os.tmpdir(), 'free-exercise-db')
  if (!fs.existsSync(path.join(dir, 'exercises'))) {
    console.log('Cloning free-exercise-db (shallow, images only)…')
    fs.rmSync(dir, { recursive: true, force: true })
    execSync(
      `git clone --depth 1 --filter=blob:none --no-checkout https://github.com/yuhonas/free-exercise-db.git ${JSON.stringify(dir)}`,
      { stdio: 'inherit' },
    )
    execSync("git sparse-checkout set --no-cone '/exercises' '/dist'", { cwd: dir, stdio: 'inherit' })
    execSync('git checkout', { cwd: dir, stdio: 'inherit' })
  }
  return dir
}

const source = resolveSource(process.argv[2])
const raw = JSON.parse(fs.readFileSync(path.join(source, 'dist', 'exercises.json'), 'utf8'))
console.log(`Read ${raw.length} exercises from ${source}`)

fs.rmSync(outImages, { recursive: true, force: true })
fs.mkdirSync(outImages, { recursive: true })

const catalogue = []
let converted = 0
let missing = 0

for (const ex of raw) {
  const primary = ex.primaryMuscles ?? []
  const secondary = ex.secondaryMuscles ?? []
  const bodyParts = [...new Set(primary.map((m) => BODY_PART_BY_MUSCLE[m]).filter(Boolean))]
  if (bodyParts.length === 0) bodyParts.push('core')

  const images = []
  for (const [i, rel] of (ex.images ?? []).entries()) {
    const src = path.join(source, 'exercises', rel)
    if (!fs.existsSync(src)) {
      missing += 1
      continue
    }
    const destDir = path.join(outImages, ex.id)
    fs.mkdirSync(destDir, { recursive: true })
    const dest = path.join(destDir, `${i}.webp`)
    await sharp(src).resize({ width: 420, withoutEnlargement: true }).webp({ quality: 62 }).toFile(dest)
    images.push(i)
    converted += 1
  }

  catalogue.push({
    id: ex.id,
    name: ex.name,
    bodyParts,
    primaryMuscles: primary,
    secondaryMuscles: secondary,
    equipment: EQUIPMENT_MAP[ex.equipment] ?? 'other',
    category: ex.category ?? 'strength',
    mechanic: ex.mechanic ?? null,
    force: ex.force ?? null,
    level: ex.level ?? 'beginner',
    instructions: ex.instructions ?? [],
    images,
  })
}

catalogue.sort((a, b) => a.name.localeCompare(b.name))
fs.writeFileSync(outJson, JSON.stringify(catalogue))

const bytes = fs.statSync(outJson).size
console.log(`\nWrote ${catalogue.length} exercises -> public/exercises.json (${(bytes / 1024).toFixed(0)} KB)`)
console.log(`Converted ${converted} images -> public/ex/ (${missing} referenced files were missing upstream)`)
