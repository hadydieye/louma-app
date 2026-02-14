import { useState } from "react";
import { supabase } from "../../utils/supabase";

export const useGoogleSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[GoogleSignIn] Starting Google OAuth with Supabase");

      // Use Supabase's native Google OAuth
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });


      if (data.session) {
        console.log("[GoogleSignIn] Login successful");
        return { data, error: null };
      }

      if (signInError) {
        setError(signInError.message);
        return { error: signInError };
      }

      return { data, error: null };
    } catch (err: any) {
      const errorMsg = err.message || "Erreur inconnue lors de la connexion Google";
      console.error("[GoogleSignIn] Error:", errorMsg);
      setError(errorMsg);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
    error,
  };
};
