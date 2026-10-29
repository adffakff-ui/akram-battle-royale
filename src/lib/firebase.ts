import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const syncUserProfile = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const initialData = {
    uid: user.uid,
    displayName: user.displayName || 'لاعب جديد',
    email: user.email,
    photoURL: user.photoURL,
    lastActive: new Date().toISOString(),
  };
  await setDoc(userRef, initialData, { merge: true });
};

export const getLeaderboard = async () => {
  try {
    const q = query(collection(db, 'users'), orderBy('totalKills', 'desc'), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.warn("Could not fetch leaderboard:", err);
    return [];
  }
};

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();
