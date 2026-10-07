"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  signInCustomer,
  signOutCustomer,
  signUpCustomer,
} from "@/lib/customer-auth";

interface CustomerAuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
  }) => Promise<{ error: string | null }>;
  signIn: (params: {
    email: string;
    password: string;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(
  null
);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (params: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    const result = await signUpCustomer(params);
    return { error: result.error };
  };

  const signIn = async (params: { email: string; password: string }) => {
    const result = await signInCustomer(params);
    return { error: result.error };
  };

  const signOut = async () => {
    await signOutCustomer();
  };

  return (
    <CustomerAuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error(
      "useCustomerAuth must be used within a CustomerAuthProvider"
    );
  }
  return ctx;
}
