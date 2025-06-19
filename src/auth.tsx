import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface Tokens {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isPending: boolean;
  requestToken: () => void;
  exchangeCode: (code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  const requestToken = useCallback(() => {
    setIsPending(true);
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = "http://localhost:5173/auth/callback";
    const scope = "repo read:user user:email";

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    window.location.href = githubAuthUrl;
  }, []);

  const exchangeCode = useCallback(async (code: string): Promise<boolean> => {
    const response = await fetch(
      `${import.meta.env.VITE_PROXY_URL}exchange?code=${code}`
    );

    const data = await response.json();

    if (data.access_token && data.refresh_token) {
      setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      setIsPending(false);
      return true;
    }

    setIsPending(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    setIsPending(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        tokens,
        isAuthenticated: !!tokens,
        isPending,
        requestToken,
        exchangeCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
