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

async function sendWelcomeEmail(name: string, email: string) {
  try {
    const res = await fetch(`${REDIRECT_URL}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: "Welcome to CareNova! 🎉",
        text: `Hi ${name},\n\nWelcome to CareNova! Your account has been successfully created.\n\nYou can now access all health features including:\n- Medical Report Analyzer\n- Drug Price Detection\n- Risk Prediction\n- Health Trends\n- AI Medical Chatbot\n\nStay healthy!\nThe CareNova Team`,
      }),
    });
    const data = await res.json();
    console.log("[Welcome Email]", data);
  } catch (err) {
    console.warn("[Welcome Email] Failed:", err);
  }
}

export async function signUp(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });
  saveUserIfNew(user.uid, name, email, "email");
  saveUserProfile(user.uid, name, email);
  sendWelcomeEmail(name, email);
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
