import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  UserProfile,
  getUser,
  saveUser,
  logout as doLogout,
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
  login: (username: string, genres: string[]) => void;
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

  const login = useCallback((username: string, genres: string[]) => {
    const profile: UserProfile = {
      username,
      favoriteGenres: genres,
      ratings: {},
      watchHistory: [],
      watchLater: [],
    };
    saveUser(profile);
    setUser(profile);
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
      value={{ user, login, logout, addWatch, rate, setGenres, addWatchLater, removeWatchLater }}
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
