import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (phone: string, password: string) => Promise<{ error: string | null }>;
  signIn: (phone: string, password: string) => Promise<{ error: string | null }>;
  signInAdmin: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

// Only this email is allowed to use the admin login form.
export const ADMIN_EMAIL = "gina@enrutate.com";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Convert phone to a synthetic email used internally by Supabase auth.
// Keeps only digits so "+52 664 123 4567" and "6641234567" match.
export const phoneToEmail = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@ruta22.local`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // defer to avoid deadlock
        setTimeout(() => checkAdmin(newSession.user.id), 0);
      } else {
        setIsAdmin(false);
      }
    });

    // Then load existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        checkAdmin(existingSession.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (phone: string, password: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return { error: "Ingresa un número de teléfono válido (mínimo 10 dígitos)." };
    if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };

    const email = phoneToEmail(digits);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")) {
        return { error: "Este número ya está registrado. Inicia sesión." };
      }
      return { error: error.message };
    }

    // Insert profile row with the real phone digits
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ user_id: data.user.id, phone: digits });
      if (profileError && !profileError.message.includes("duplicate")) {
        console.error("[Auth] profile insert error:", profileError);
      }
    }
    return { error: null };
  };

  const signIn = async (phone: string, password: string) => {
    const email = phoneToEmail(phone);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("invalid")) {
        return { error: "Teléfono o contraseña incorrectos." };
      }
      return { error: error.message };
    }
    return { error: null };
  };

  const signInAdmin = async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (normalized !== ADMIN_EMAIL) {
      return { error: "Este correo no tiene acceso de administrador." };
    }
    const { error } = await supabase.auth.signInWithPassword({ email: normalized, password });
    if (error) {
      if (error.message.toLowerCase().includes("invalid")) {
        return { error: "Correo o contraseña incorrectos." };
      }
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signUp, signIn, signInAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
