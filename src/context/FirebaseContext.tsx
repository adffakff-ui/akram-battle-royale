import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  userData: any | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  userData: null,
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          // Initialize user profile
          const initialData = {
            uid: user.uid,
            displayName: user.displayName || 'لاعب جديد',
            email: user.email,
            photoURL: user.photoURL,
            totalKills: 0,
            totalWins: 0,
            totalMatches: 0,
            level: 1,
            lastActive: new Date().toISOString(),
          };
          await setDoc(userRef, initialData);
          setUserData(initialData);

          // Initialize Forex Account
          const forexRef = doc(db, 'forexAccounts', user.uid);
          await setDoc(forexRef, {
            userId: user.uid,
            balance: 10000, // Demo balance
            currency: 'USD',
            leverage: 100,
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, userData }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
