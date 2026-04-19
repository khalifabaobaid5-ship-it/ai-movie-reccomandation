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

const STORAGE_KEY = "cineai_user";

export function getUser(): UserProfile | null {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  const parsed = JSON.parse(data) as UserProfile;
  // Backfill for older saved profiles
  if (!parsed.watchLater) parsed.watchLater = [];
  if (!parsed.watchHistory) parsed.watchHistory = [];
  if (!parsed.ratings) parsed.ratings = {};
  return parsed;
}

export function saveUser(user: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
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
