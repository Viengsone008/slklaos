"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

type LoginType = 'admin' | 'employee' | 'manager';

interface User {
  id: string;
  email: string;
  name: string;
  role: LoginType;
  loginType: LoginType;
  department?: string;
  position?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, loginType: LoginType) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from Supabase session on mount
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && data.session.user) {
        const supaUser = data.session.user;
        setUser({
          id: supaUser.id,
          email: supaUser.email ?? "",
          name: supaUser.user_metadata?.name ?? "",
          role: supaUser.user_metadata?.role ?? "employee",
          loginType: supaUser.user_metadata?.login_type ?? "employee",
          department: supaUser.user_metadata?.department,
          position: supaUser.user_metadata?.position,
          permissions: supaUser.user_metadata?.permissions ?? [],
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    getSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        const supaUser = session.user;
        setUser({
          id: supaUser.id,
          email: supaUser.email ?? "",
          name: supaUser.user_metadata?.name ?? "",
          role: supaUser.user_metadata?.role ?? "employee",
          loginType: supaUser.user_metadata?.login_type ?? "employee",
          department: supaUser.user_metadata?.department,
          position: supaUser.user_metadata?.position,
          permissions: supaUser.user_metadata?.permissions ?? [],
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Login function using Supabase Auth
  const login = async (
    email: string,
    password: string,
    loginType: LoginType
  ): Promise<boolean> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error || !data.user) return false;

    // Optionally check loginType in user_metadata
    const userLoginType = data.user.user_metadata?.login_type;
    if (userLoginType !== loginType) {
      await supabase.auth.signOut();
      setUser(null);
      return false;
    }

    setUser({
      id: data.user.id,
      email: data.user.email ?? "",
      name: data.user.user_metadata?.name ?? "",
      role: data.user.user_metadata?.role ?? "employee",
      loginType: data.user.user_metadata?.login_type ?? "employee",
      department: data.user.user_metadata?.department,
      position: data.user.user_metadata?.position,
      permissions: data.user.user_metadata?.permissions ?? [],
    });
    return true;
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/admin-login');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;