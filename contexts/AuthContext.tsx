"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  UserProfile,
  createUserProfile,
  getUserProfile,
  subscribeToUserProfile,
  updateLastLogin,
} from "@/lib/firebase/users";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user profile exists, create if not
        const existingProfile = await getUserProfile(user.uid);
        
        if (!existingProfile) {
          // Create profile for users who signed up before profile system was added
          const tenantId = `tenant-${Date.now()}`;
          await createUserProfile(
            user.uid,
            user.email || '',
            user.displayName || 'User',
            tenantId,
            "admin"
          );
        } else {
          // Update last login only if profile exists
          await updateLastLogin(user.uid);
        }
        
        // Subscribe to user profile
        const unsubscribeProfile = subscribeToUserProfile(user.uid, (profile) => {
          setUserProfile(profile);
          setLoading(false);
        });
        
        return () => unsubscribeProfile();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    // Update profile with display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName,
      });
      
      // Create user profile with default tenant
      const tenantId = `tenant-${Date.now()}`;
      await createUserProfile(
        userCredential.user.uid,
        email,
        displayName,
        tenantId,
        "admin" // Default role for new signups
      );
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user profile exists
    if (result.user) {
      const existingProfile = await getUserProfile(result.user.uid);
      
      if (!existingProfile) {
        // Create profile for first-time Google sign-in
        const tenantId = `tenant-${Date.now()}`;
        await createUserProfile(
          result.user.uid,
          result.user.email || "",
          result.user.displayName || "User",
          tenantId,
          "admin"
        );
      }
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    userProfile,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
