import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  UserProfile,
  getUser,
  logout as doLogout,
  signIn as doSignIn,
  signUp as doSignUp,
  AuthResult,
  addToWatchHistory,
  rateMovie,
  updateFavoriteGenres,
  addToWatchLater,
  removeFromWatchLater,
  WatchHistoryItem,
  WatchLaterItem,
} from "@/lib/userStore";

interface AuthContextType {
  user: UserProfile | null;
  signIn: (username: string, password: string) => AuthResult;
  signUp: (username: string, password: string, genres: string[]) => AuthResult;
  logout: () => void;
  addWatch: (item: Omit<WatchHistoryItem, "watchedAt">) => void;
  rate: (imdbID: string, score: number, review: string) => void;
  setGenres: (genres: string[]) => void;
  addWatchLater: (item: Omit<WatchLaterItem, "addedAt">) => void;
  removeWatchLater: (imdbID: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(getUser);

  const signIn = useCallback((username: string, password: string): AuthResult => {
    const result = doSignIn(username, password);
    if (result.ok) setUser(result.profile);
    return result;
  }, []);

  const signUp = useCallback((username: string, password: string, genres: string[]): AuthResult => {
    const result = doSignUp(username, password, genres);
    if (result.ok) setUser(result.profile);
    return result;
  }, []);

  const logout = useCallback(() => {
    doLogout();
    setUser(null);
  }, []);

  const addWatch = useCallback((item: Omit<WatchHistoryItem, "watchedAt">) => {
    setUser((prev) => (prev ? addToWatchHistory(prev, item) : null));
  }, []);

  const rate = useCallback((imdbID: string, score: number, review: string) => {
    setUser((prev) => (prev ? rateMovie(prev, imdbID, score, review) : null));
  }, []);

  const setGenres = useCallback((genres: string[]) => {
    setUser((prev) => (prev ? updateFavoriteGenres(prev, genres) : null));
  }, []);

  const addWatchLater = useCallback((item: Omit<WatchLaterItem, "addedAt">) => {
    setUser((prev) => (prev ? addToWatchLater(prev, item) : null));
  }, []);

  const removeWatchLater = useCallback((imdbID: string) => {
    setUser((prev) => (prev ? removeFromWatchLater(prev, imdbID) : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, signIn, signUp, logout, addWatch, rate, setGenres, addWatchLater, removeWatchLater }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
