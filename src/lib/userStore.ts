export interface UserRating {
  imdbID: string;
  score: number; // 1-10
  review: string;
  date: string;
}

export interface WatchHistoryItem {
  imdbID: string;
  title: string;
  poster: string;
  genre: string;
  year: string;
  watchedAt: string;
  rating?: number;
}

export interface WatchLaterItem {
  imdbID: string;
  title: string;
  poster: string;
  year: string;
  genre?: string;
  addedAt: string;
}

export interface UserProfile {
  username: string;
  favoriteGenres: string[];
  ratings: Record<string, UserRating>;
  watchHistory: WatchHistoryItem[];
  watchLater: WatchLaterItem[];
}

interface StoredAccount {
  password: string;
  profile: UserProfile;
}

const SESSION_KEY = "cineai_user";
const ACCOUNTS_KEY = "cineai_accounts";

function normalizeKey(username: string) {
  return username.trim().toLowerCase();
}

function readAccounts(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StoredAccount>;
  } catch {
    return {};
  }
}

function writeAccounts(accounts: Record<string, StoredAccount>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function backfill(profile: UserProfile): UserProfile {
  if (!profile.watchLater) profile.watchLater = [];
  if (!profile.watchHistory) profile.watchHistory = [];
  if (!profile.ratings) profile.ratings = {};
  if (!profile.favoriteGenres) profile.favoriteGenres = [];
  return profile;
}

export function getUser(): UserProfile | null {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    return backfill(JSON.parse(data) as UserProfile);
  } catch {
    return null;
  }
}

export function saveUser(user: UserProfile) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  // Persist into accounts store too (preserve password)
  const accounts = readAccounts();
  const key = normalizeKey(user.username);
  const existing = accounts[key];
  if (existing) {
    accounts[key] = { password: existing.password, profile: user };
    writeAccounts(accounts);
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function accountExists(username: string): boolean {
  const accounts = readAccounts();
  return Boolean(accounts[normalizeKey(username)]);
}

export type AuthResult =
  | { ok: true; profile: UserProfile }
  | { ok: false; error: string };

export function signUp(username: string, password: string, genres: string[]): AuthResult {
  const name = username.trim();
  if (!name) return { ok: false, error: "Username is required" };
  if (!password) return { ok: false, error: "Password is required" };
  const accounts = readAccounts();
  const key = normalizeKey(name);
  if (accounts[key]) {
    return { ok: false, error: "An account with that username already exists. Try signing in." };
  }
  const profile: UserProfile = {
    username: name,
    favoriteGenres: genres,
    ratings: {},
    watchHistory: [],
    watchLater: [],
  };
  accounts[key] = { password, profile };
  writeAccounts(accounts);
  localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  return { ok: true, profile };
}

export function signIn(username: string, password: string): AuthResult {
  const accounts = readAccounts();
  const key = normalizeKey(username);
  const account = accounts[key];
  if (!account) return { ok: false, error: "No account found with that username." };
  if (account.password !== password) return { ok: false, error: "Incorrect password." };
  const profile = backfill(account.profile);
  localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  return { ok: true, profile };
}

export function addToWatchHistory(user: UserProfile, item: Omit<WatchHistoryItem, "watchedAt">): UserProfile {
  const exists = user.watchHistory.find((h) => h.imdbID === item.imdbID);
  if (exists) return user;
  const updated = {
    ...user,
    watchHistory: [{ ...item, watchedAt: new Date().toISOString() }, ...user.watchHistory],
  };
  saveUser(updated);
  return updated;
}

export function rateMovie(user: UserProfile, imdbID: string, score: number, review: string): UserProfile {
  const updated = {
    ...user,
    ratings: {
      ...user.ratings,
      [imdbID]: { imdbID, score, review, date: new Date().toISOString() },
    },
  };
  saveUser(updated);
  return updated;
}

export function updateFavoriteGenres(user: UserProfile, genres: string[]): UserProfile {
  const updated = { ...user, favoriteGenres: genres };
  saveUser(updated);
  return updated;
}

export function addToWatchLater(user: UserProfile, item: Omit<WatchLaterItem, "addedAt">): UserProfile {
  if (user.watchLater.some((w) => w.imdbID === item.imdbID)) return user;
  const updated = {
    ...user,
    watchLater: [{ ...item, addedAt: new Date().toISOString() }, ...user.watchLater],
  };
  saveUser(updated);
  return updated;
}

export function removeFromWatchLater(user: UserProfile, imdbID: string): UserProfile {
  const updated = { ...user, watchLater: user.watchLater.filter((w) => w.imdbID !== imdbID) };
  saveUser(updated);
  return updated;
}

export const ALL_GENRES = [
  "Action", "Comedy", "Drama", "Horror", "Sci-Fi",
  "Romance", "Thriller", "Animation", "Documentary", "Adventure",
];
