import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';
import { auth, database, functions } from '../lib/firebase';

interface UserData {
  uid: string;
  email: string | null;
  name: string | null;
  restaurantId: string | null;
  role: string | null;
  status: string | null;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  createRestaurant: (data: any) => Promise<any>;
  inviteStaff: (emailOrPhone: string, role: string) => Promise<any>;
  acceptInvite: (restaurantId: string, token: string) => Promise<any>;
  updateUserRole: (targetUserId: string, newRole: string) => Promise<any>;
  updateRestaurantProfile: (data: any) => Promise<any>;
  deactivateUser: (targetUserId: string) => Promise<any>;
  revokeInvite: (token: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Realtime Database
  const fetchUserData = async (uid: string): Promise<UserData | null> => {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return {
          uid,
          email: data.email || null,
          name: data.name || null,
          restaurantId: data.restaurantId || null,
          role: data.role || null,
          status: data.status || null,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Refresh user data and token
  const refreshUserData = async () => {
    if (user) {
      // Force token refresh to get updated custom claims
      await user.getIdToken(true);
      const data = await fetchUserData(user.uid);
      setUserData(data);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const data = await fetchUserData(firebaseUser.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with name
    await updateProfile(userCredential.user, { displayName: name });
    
    return userCredential.user;
  };

  const signIn = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const signInWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
    setUserData(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  // Cloud Functions callable wrappers
  const createRestaurant = async (data: any) => {
    const callable = httpsCallable(functions, 'createRestaurant');
    const result = await callable(data);
    await refreshUserData();
    return result.data;
  };

  const inviteStaff = async (emailOrPhone: string, role: string) => {
    const callable = httpsCallable(functions, 'inviteStaff');
    const result = await callable({ emailOrPhone, role });
    return result.data;
  };

  const acceptInvite = async (restaurantId: string, token: string) => {
    const callable = httpsCallable(functions, 'acceptInvite');
    const result = await callable({ restaurantId, token });
    await refreshUserData();
    return result.data;
  };

  const updateUserRole = async (targetUserId: string, newRole: string) => {
    const callable = httpsCallable(functions, 'updateUserRole');
    const result = await callable({ targetUserId, newRole });
    return result.data;
  };

  const updateRestaurantProfile = async (data: any) => {
    const callable = httpsCallable(functions, 'updateRestaurantProfile');
    const result = await callable(data);
    return result.data;
  };

  const deactivateUser = async (targetUserId: string) => {
    const callable = httpsCallable(functions, 'deactivateUser');
    const result = await callable({ targetUserId });
    return result.data;
  };

  const revokeInvite = async (token: string) => {
    const callable = httpsCallable(functions, 'revokeInvite');
    const result = await callable({ token });
    return result.data;
  };

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    refreshUserData,
    createRestaurant,
    inviteStaff,
    acceptInvite,
    updateUserRole,
    updateRestaurantProfile,
    deactivateUser,
    revokeInvite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
