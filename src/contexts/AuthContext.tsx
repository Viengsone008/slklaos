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
      try {
        const { data, error } = await supabase.auth.getSession();
        
        // Handle refresh token errors
        if (error) {
          console.warn('Session error:', error.message);
          // Clear any invalid session data
          await supabase.auth.signOut();
          setUser(null);
          setIsLoading(false);
          return;
        }

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
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    getSession();

    // Listen for auth state changes with error handling
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (!session) {
            setUser(null);
            return;
          }
        }

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
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
        // Clear any corrupted session
        await supabase.auth.signOut();
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
    
    try {
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error || !data.user) {
        console.error('Login error:', error?.message);
        setIsLoading(false);
        return false;
      }

      // Optionally check loginType in user_metadata
      const userLoginType = data.user.user_metadata?.login_type;
      if (userLoginType !== loginType) {
        await supabase.auth.signOut();
        setUser(null);
        setIsLoading(false);
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
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Logout function with improved error handling
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Clear any stored auth data
      localStorage.removeItem('supabase.auth.token');
      router.push('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear user state even if logout fails
      setUser(null);
      router.push('/admin-login');
    }
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