import React from 'react';
import { auth, googleProvider, syncUserProfile } from '../../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { LucideLogOut, LucideUser } from 'lucide-react';

export function AuthSection({ user }: { user: any }) {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(result.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (user) {
    return (
      <div className="flex items-center gap-3 bg-slate-950/60 backdrop-blur-md border border-white/10 p-2 rounded-2xl shadow-xl">
        <div className="flex flex-col items-end">
          <span className="text-white text-[10px] font-black truncate max-w-[100px]">{user.displayName}</span>
          <button onClick={handleLogout} className="text-rose-400 text-[8px] font-bold flex items-center gap-1 hover:text-rose-300">
            <LucideLogOut className="w-2.5 h-2.5" /> تسجيل الخروج
          </button>
        </div>
        {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-amber-500/50" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
            <LucideUser className="w-4 h-4 text-amber-500" />
          </div>
        )}
      </div>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2"
    >
      <span className="text-lg">🇾🇪</span>
      تسجيل الدخول بالمقاتل
    </button>
  );
}
