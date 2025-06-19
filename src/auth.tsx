import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";

interface User {
  login: string;
  name: string;
  avatar_url: string;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
}

interface AuthData {
  user: User;
  tokens: Tokens;
}

export interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isPending: boolean;
  requestToken: () => void;
  exchangeCode: (code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// localStorage key for storing auth data
const AUTH_STORAGE_KEY = "ghlf_auth_data";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthData] = useState<AuthData | null>(() => {
    // Load auth data from localStorage on initialization
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      return storedAuth ? JSON.parse(storedAuth) : null;
    } catch (error) {
      console.error("Failed to load auth data from localStorage:", error);
      return null;
    }
  });
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
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
          Accept: "application/vnd.github+json",
        },
      });
      const user = await userResponse.json();

      const newAuthData: AuthData = {
        user,
        tokens: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        },
      };

      setAuthData(newAuthData);
      setIsPending(false);
      return true;
    }

    setIsPending(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuthData(null);
    setIsPending(false);
  }, []);

  // Save auth data to localStorage whenever it changes
  useEffect(() => {
    if (authData) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      } catch (error) {
        console.error("Failed to save auth data to localStorage:", error);
      }
    } else {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (error) {
        console.error("Failed to remove auth data from localStorage:", error);
      }
    }
  }, [authData]);

  return (
    <AuthContext.Provider
      value={{
        user: authData?.user ?? null,
        tokens: authData?.tokens ?? null,
        isAuthenticated: !!authData,
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
