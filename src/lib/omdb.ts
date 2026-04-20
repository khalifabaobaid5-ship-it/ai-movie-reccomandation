const OMDB_API_KEY = "3cc48fa";
const BASE_URL = "https://www.omdbapi.com/";

export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
  Genre?: string;
  Plot?: string;
  imdbRating?: string;
  Director?: string;
  Actors?: string;
  Runtime?: string;
  Rated?: string;
  Released?: string;
}

export interface SearchResult {
  Search?: Movie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

export async function searchMovies(query: string, page = 1, year?: number): Promise<SearchResult> {
  const yParam = year ? `&y=${year}` : "";
  const res = await fetch(`${BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&page=${page}${yParam}&type=movie`);
  return res.json();
}

export async function searchByYear(year: number, page = 1): Promise<SearchResult> {
  // Broad term + year filter to surface recent titles
  const terms = ["movie", "the", "love", "man"];
  const term = terms[(page - 1) % terms.length];
  return searchMovies(term, page, year);
}

export async function getMovieById(id: string): Promise<Movie & { Response: string }> {
  const res = await fetch(`${BASE_URL}?apikey=${OMDB_API_KEY}&i=${encodeURIComponent(id)}&plot=full`);
  return res.json();
}

export async function searchByGenre(genre: string, page = 1): Promise<SearchResult> {
  // OMDB doesn't support genre search directly, so we search popular terms per genre
  const genreTerms: Record<string, string> = {
    Action: "action hero",
    Comedy: "comedy funny",
    Drama: "drama story",
    Horror: "horror dark",
    "Sci-Fi": "science fiction space",
    Romance: "love romance",
    Thriller: "thriller suspense",
    Animation: "animated cartoon",
    Documentary: "documentary real",
    Adventure: "adventure quest",
  };
  const term = genreTerms[genre] || genre;
  return searchMovies(term, page);
}
