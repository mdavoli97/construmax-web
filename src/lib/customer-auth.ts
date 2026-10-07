import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

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
