const U = window.__uid ? { uid: window.__uid, email: window.__uid.toLowerCase() + "@test.ma" } : { uid: "UIDRITA", email: "ritabentahila@gmail.com" }; // window.__uid : autre membre (tests)
export function getAuth() { return { currentUser: U }; }
export function onAuthStateChanged(a, f) { setTimeout(() => f(U), 0); return () => {}; }
export async function signOut() {}
export async function createUserWithEmailAndPassword(a, e) { return { user: { uid: "U" + Math.random().toString(36).slice(2, 8), email: e } }; }
export async function sendPasswordResetEmail() {}
export async function updatePassword() {}
export async function reauthenticateWithCredential() {}
export const EmailAuthProvider = { credential: () => ({}) };
export const browserLocalPersistence = {};
export async function setPersistence() {}
export async function signInWithEmailAndPassword() {}
