import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore/lite'

// A Firebase web config is public by design: it only identifies the project. What protects
// the data is firestore.rules, which lets each signed-in user touch nothing but their own
// users/{uid} subtree.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId)

if (!isFirebaseConfigured) {
  console.warn('Firebase is not configured — set the VITE_FIREBASE_* variables.')
}

const app = initializeApp({
  ...config,
  apiKey: config.apiKey ?? 'placeholder',
  projectId: config.projectId ?? 'placeholder',
})

export const auth = getAuth(app)
export const firestore = getFirestore(app)
