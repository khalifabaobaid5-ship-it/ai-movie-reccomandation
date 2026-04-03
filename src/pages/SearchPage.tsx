import { useState } from "react";
import { searchMovies, Movie } from "@/lib/omdb";
import { MovieCard } from "@/components/MovieCard";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratingFilter, setRatingFilter] = useState("all");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const data = await searchMovies(query);
    setResults(data.Search || []);
    setLoading(false);
  };

  const filteredResults = results.filter((m) => {
    if (ratingFilter === "all") return true;
    const r = user?.ratings[m.imdbID]?.score || 0;
    if (ratingFilter === "rated") return r > 0;
    if (ratingFilter === "unrated") return r === 0;
    if (ratingFilter === "high") return r >= 7;
    return true;
  });

  return (
    <div className="pt-20 pb-10 container space-y-6">
      <h1 className="text-3xl font-display font-bold text-foreground">Search Movies</h1>

      <div className="flex gap-2">
        <Input
          placeholder="Search for movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="bg-secondary border-border"
        />
        <Button onClick={handleSearch} className="bg-primary text-primary-foreground hover:opacity-90">
          <Search size={18} />
        </Button>
      </div>

      {results.length > 0 && (
        <div className="flex items-center gap-3">
          <SlidersHorizontal size={16} className="text-muted-foreground" />
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-40 bg-secondary border-border">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="rated">Rated by me</SelectItem>
              <SelectItem value="unrated">Not rated</SelectItem>
              <SelectItem value="high">High rated (7+)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredResults.map((m) => (
            <MovieCard key={m.imdbID} movie={m} userRating={user?.ratings[m.imdbID]?.score} />
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <p className="text-center text-muted-foreground py-10">No movies found. Try a different search.</p>
      )}
    </div>
  );
}
