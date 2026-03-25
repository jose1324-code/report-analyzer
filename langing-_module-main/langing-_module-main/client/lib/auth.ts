import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

const REDIRECT_URL = import.meta.env.VITE_DASHBOARD_URL ?? "http://localhost:3000";

async function saveUserIfNew(uid: string, name: string, email: string, provider: string) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { uid, name, email, provider, createdAt: serverTimestamp() });
    }
  } catch (err) {
    console.warn("Firestore write skipped:", err);
  }
}

async function saveUserProfile(uid: string, name: string, email: string) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    // Only set name/email if profile doesn't exist yet — don't overwrite user edits
    if (!snap.exists()) {
      await setDoc(ref, {
        userId: uid,
        fullName: name,
        email,
        phone: "",
        dateOfBirth: "",
        address: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Always keep email + name in sync if they were empty
      const data = snap.data();
      const updates: Record<string, string> = {};
      if (!data.fullName && name) updates.fullName = name;
      if (!data.email && email) updates.email = email;
      if (Object.keys(updates).length) {
        await setDoc(ref, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
      }
    }
  } catch (err) {
    console.warn("userProfiles write skipped:", err);
  }
}

function redirectToDashboard(uid: string, name: string, email: string) {
  const url = `${REDIRECT_URL}?${new URLSearchParams({ uid, name, email }).toString()}`;
  // If running inside a popup (Google OAuth), redirect the opener and close
  if (window.opener && !window.opener.closed) {
    window.opener.location.href = url;
    window.close();
  } else {
    window.location.href = url;
  }
}

export async function signUp(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });
  saveUserIfNew(user.uid, name, email, "email");
  saveUserProfile(user.uid, name, email);
  redirectToDashboard(user.uid, name, email);
}

export async function signIn(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const name = user.displayName ?? "";
  saveUserIfNew(user.uid, name, email, "email");
  saveUserProfile(user.uid, name, email);
  redirectToDashboard(user.uid, name, email);
}

export async function signInWithGoogle() {
  const { user } = await signInWithPopup(auth, googleProvider);
  const name = user.displayName ?? "";
  const email = user.email ?? "";
  saveUserIfNew(user.uid, name, email, "google");
  saveUserProfile(user.uid, name, email);
  redirectToDashboard(user.uid, name, email);
}
