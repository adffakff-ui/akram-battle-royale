import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  getDocFromServer,
  increment,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling according to Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Helper Functions for the Game
export async function syncUserProfile(user: any) {
  const userRef = doc(db, 'users', user.uid);
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || 'مقاتل يمني',
        email: user.email,
        photoURL: user.photoURL,
        totalKills: 0,
        totalWins: 0,
        totalMatches: 0,
        exploredGovs: ['sanaa_capital'],
        level: 1,
        lastActive: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        lastActive: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

export async function saveMatchResult(kills: number, won: boolean, govId: string) {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  const matchId = Math.random().toString(36).substring(2, 15);
  
  try {
    // 1. Save match record
    await setDoc(doc(db, 'matches', matchId), {
      matchId,
      userId: uid,
      kills,
      won,
      governorateId: govId,
      timestamp: serverTimestamp()
    });

    // 2. Update user stats
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      totalKills: increment(kills),
      totalWins: won ? increment(1) : increment(0),
      totalMatches: increment(1),
      exploredGovs: arrayUnion(govId)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'matches/update');
  }
}

export async function getLeaderboard() {
  try {
    const q = query(collection(db, 'users'), orderBy('totalKills', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
}
