import { useState } from "react";
import { searchMovies, getMovieById, searchByGenre, Movie } from "@/lib/omdb";
import { MovieCard } from "@/components/MovieCard";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SEARCH_FIELDS = [
  { value: "title", label: "Title" },
  { value: "actor", label: "Actor" },
  { value: "director", label: "Director" },
  { value: "genre", label: "Genre" },
];

const GENRES = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Animation", "Documentary", "Adventure"];

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [searchField, setSearchField] = useState("title");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [genreFilter, setGenreFilter] = useState("all");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [minRating, setMinRating] = useState("");
  const [resultLimit, setResultLimit] = useState("20");

  const handleSearch = async () => {
    const hasQuery = query.trim().length > 0;
    const hasFilter =
      genreFilter !== "all" || yearFrom || yearTo || minRating || resultLimit !== "20";

    if (!hasQuery && !hasFilter) {
      toast.error("Enter a search term or pick at least one filter");
      return;
    }

    setLoading(true);

    // Build initial result set from API.
    let initial: Movie[] = [];

    if (hasQuery) {
      // For Actor/Director: OMDB has no person index, so we widen the candidate
      // pool by pulling the typed name as a title AND extra pages of broad
      // seeds (optionally constrained by genre). We then strictly filter
      // hydrated results by Actors/Director below.
      if (searchField === "actor" || searchField === "director") {
        const seeds: Promise<{ Search?: Movie[] }>[] = [
          searchMovies(query, 1),
          searchMovies(query, 2),
        ];
        if (genreFilter !== "all") {
          seeds.push(searchByGenre(genreFilter, 1), searchByGenre(genreFilter, 2), searchByGenre(genreFilter, 3));
        } else {
          // Generic broad seeds to expand the pool
          seeds.push(
            searchMovies("the", 1, yearFrom ? parseInt(yearFrom) : undefined),
            searchMovies("movie", 1, yearFrom ? parseInt(yearFrom) : undefined),
            searchMovies("man", 1, yearFrom ? parseInt(yearFrom) : undefined),
          );
        }
        const seedResults = await Promise.all(seeds);
        initial = seedResults.flatMap((r) => r.Search || []);
      } else {
        const data = await searchMovies(query);
        initial = data.Search || [];
      }
    } else if (genreFilter !== "all") {
      const [p1, p2] = await Promise.all([searchByGenre(genreFilter, 1), searchByGenre(genreFilter, 2)]);
      initial = [...(p1.Search || []), ...(p2.Search || [])];
    } else {
      const seedYear = yearFrom ? parseInt(yearFrom) : undefined;
      const [p1, p2] = await Promise.all([
        searchMovies("movie", 1, seedYear),
        searchMovies("the", 1, seedYear),
      ]);
      initial = [...(p1.Search || []), ...(p2.Search || [])];
    }

    // De-dupe
    initial = Array.from(new Map(initial.map((m) => [m.imdbID, m])).values());

    // For person searches we need a bigger hydration pool because most
    // candidates won't actually feature the person.
    const limit = Math.min(parseInt(resultLimit) || 20, 50);
    const hydrationCap =
      hasQuery && (searchField === "actor" || searchField === "director")
        ? Math.min(initial.length, 60)
        : limit;
    initial = initial.slice(0, hydrationCap);

    // Hydrate with full details for filtering
    const detailed = await Promise.all(
      initial.map(async (m) => {
        const full = await getMovieById(m.imdbID);
        return full.Response === "True" ? { ...m, ...full } : m;
      })
    );

    // Apply field-specific matching only when there's a query
    const q = query.toLowerCase();
    let fieldFiltered = hasQuery
      ? detailed.filter((m) => {
          if (searchField === "title") return m.Title?.toLowerCase().includes(q);
          if (searchField === "actor") return m.Actors?.toLowerCase().includes(q);
          if (searchField === "director") return m.Director?.toLowerCase().includes(q);
          if (searchField === "genre") return m.Genre?.toLowerCase().includes(q);
          return true;
        })
      : detailed;

    // Cap final results to the requested limit
    fieldFiltered = fieldFiltered.slice(0, limit);

    setResults(fieldFiltered);
    setLoading(false);
  };

  const filteredResults = results.filter((m) => {
    if (genreFilter !== "all" && !m.Genre?.toLowerCase().includes(genreFilter.toLowerCase())) return false;
    const year = parseInt(m.Year?.slice(0, 4) || "0");
    if (yearFrom && year < parseInt(yearFrom)) return false;
    if (yearTo && year > parseInt(yearTo)) return false;
    if (minRating) {
      const r = parseFloat(m.imdbRating || "0");
      if (isNaN(r) || r < parseFloat(minRating)) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setGenreFilter("all");
    setYearFrom("");
    setYearTo("");
    setMinRating("");
    setResultLimit("20");
  };

  return (
    <div className="pt-20 pb-10 container space-y-6">
      <h1 className="text-3xl font-display font-bold text-foreground">Search Movies</h1>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={searchField} onValueChange={setSearchField}>
          <SelectTrigger className="w-full sm:w-36 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_FIELDS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder={`Search by ${searchField}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="bg-secondary border-border flex-1"
        />
        <Button onClick={handleSearch} className="bg-primary text-primary-foreground hover:opacity-90">
          <Search size={18} />
        </Button>
        <Button variant="outline" onClick={() => setShowFilters((s) => !s)} className="border-border">
          <SlidersHorizontal size={18} />
        </Button>
      </div>

      {showFilters && (
        <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X size={14} className="mr-1" /> Clear
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Genre</Label>
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genres</SelectItem>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Year range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="From"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  className="bg-background border-border"
                />
                <Input
                  type="number"
                  placeholder="To"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Min IMDb rating</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="e.g. 7.5"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Number of results</Label>
              <Select value={resultLimit} onValueChange={setResultLimit}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {filteredResults.length > 0 && (
            <p className="text-sm text-muted-foreground">{filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredResults.map((m) => (
              <MovieCard key={m.imdbID} movie={m} userRating={user?.ratings[m.imdbID]?.score} />
            ))}
          </div>
        </>
      )}

      {!loading && results.length === 0 && (query || genreFilter !== "all" || yearFrom || yearTo || minRating) && (
        <p className="text-center text-muted-foreground py-10">No movies found. Try different filters or a search term.</p>
      )}
      {!loading && results.length > 0 && filteredResults.length === 0 && (
        <p className="text-center text-muted-foreground py-10">No results match your filters.</p>
      )}
    </div>
  );
}
