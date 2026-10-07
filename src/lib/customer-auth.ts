import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

export type CustomerAuthResult = {
  user: User | null;
  session: Session | null;
  error: string | null;
};

export async function signUpCustomer(params: {
  email: string;
  password: string;
  fullName: string;
}): Promise<CustomerAuthResult> {
  const { email, password, fullName } = params;

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        name: fullName.trim(),
      },
    },
  });

  return {
    user: data.user,
    session: data.session,
    error: error?.message ?? null,
  };
}

export async function signInCustomer(params: {
  email: string;
  password: string;
}): Promise<CustomerAuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email.trim(),
    password: params.password,
  });

  return {
    user: data.user,
    session: data.session,
    error: error?.message ?? null,
  };
}

export async function signOutCustomer(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export async function getCustomerSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Valida el usuario cliente a partir del header Authorization: Bearer <access_token>.
 */
export async function getCustomerUserFromRequest(
  request: NextRequest
): Promise<User | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);

  if (error || !user?.email) return null;
  return user;
}
