import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export { supabase };

export type { Session, User };

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
};

export const signOut = async () => {
  await supabase.auth.signOut();
};
