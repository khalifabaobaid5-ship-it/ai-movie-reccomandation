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

export interface UserProfile {
  username: string;
  favoriteGenres: string[];
  ratings: Record<string, UserRating>;
  watchHistory: WatchHistoryItem[];
}

const STORAGE_KEY = "cineai_user";

export function getUser(): UserProfile | null {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
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

export const ALL_GENRES = [
  "Action", "Comedy", "Drama", "Horror", "Sci-Fi",
  "Romance", "Thriller", "Animation", "Documentary", "Adventure",
];
