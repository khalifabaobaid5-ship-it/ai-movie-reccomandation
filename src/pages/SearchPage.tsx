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

export default function SearchPage() {
  const { user } = useAuth();
  const [titleQuery, setTitleQuery] = useState("");
  const [actorQuery, setActorQuery] = useState("");
  const [directorQuery, setDirectorQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [minRating, setMinRating] = useState("");
  const [resultLimit, setResultLimit] = useState("20");

  const handleSearch = async () => {
    const fields = {
      title: titleQuery.trim(),
      actor: actorQuery.trim(),
      director: directorQuery.trim(),
      genre: genreQuery.trim(),
    };
    const filledFields = Object.entries(fields).filter(([, v]) => v.length > 0);
    const hasAnyQuery = filledFields.length > 0;
    const hasFilter = yearFrom || yearTo || minRating || resultLimit !== "20";

    if (!hasAnyQuery && !hasFilter) {
      toast.error("Fill at least one search field or filter");
      return;
    }

    setLoading(true);

    // Seed candidate pool from each filled field
    const seedPromises: Promise<{ Search?: Movie[] }>[] = [];
    const seedYear = yearFrom ? parseInt(yearFrom) : undefined;

    if (fields.title) {
      seedPromises.push(searchMovies(fields.title, 1, seedYear));
      seedPromises.push(searchMovies(fields.title, 2, seedYear));
    }
    const actorList = fields.actor
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
    if (actorList.length > 0) {
      actorList.forEach((name) => {
        seedPromises.push(searchMovies(name, 1, seedYear));
        seedPromises.push(searchMovies(name, 2, seedYear));
      });
    }
    if (fields.director) {
      seedPromises.push(searchMovies(fields.director, 1, seedYear));
      seedPromises.push(searchMovies(fields.director, 2, seedYear));
    }
    if (fields.genre) {
      seedPromises.push(searchByGenre(fields.genre, 1));
      seedPromises.push(searchByGenre(fields.genre, 2));
      seedPromises.push(searchByGenre(fields.genre, 3));
    }

    if (seedPromises.length === 0) {
      // Filter-only search (year/rating)
      seedPromises.push(
        searchMovies("movie", 1, seedYear),
        searchMovies("the", 1, seedYear),
      );
    }

    const seedResults = await Promise.all(seedPromises);
    let initial: Movie[] = seedResults.flatMap((r) => r.Search || []);

    // De-dupe
    initial = Array.from(new Map(initial.map((m) => [m.imdbID, m])).values());

    const limit = Math.min(parseInt(resultLimit) || 20, 50);
    // Hydrate more candidates when person/genre matching is needed
    const needsHydration = !!(fields.actor || fields.director || fields.genre);
    const hydrationCap = needsHydration ? Math.min(initial.length, 60) : Math.min(initial.length, limit * 2);
    initial = initial.slice(0, hydrationCap);

    const detailed = await Promise.all(
      initial.map(async (m) => {
        const full = await getMovieById(m.imdbID);
        return full.Response === "True" ? { ...m, ...full } : m;
      })
    );

    // OR matching: a movie matches if ANY filled field matches it
    const matchers = {
      title: fields.title.toLowerCase(),
      actors: actorList.map((a) => a.toLowerCase()),
      director: fields.director.toLowerCase(),
      genre: fields.genre.toLowerCase(),
    };

    let fieldFiltered = hasAnyQuery
      ? detailed.filter((m) => {
          if (matchers.title && m.Title?.toLowerCase().includes(matchers.title)) return true;
          if (matchers.actors.length > 0) {
            const a = m.Actors?.toLowerCase() || "";
            if (matchers.actors.some((name) => a.includes(name))) return true;
          }
          if (matchers.director && m.Director?.toLowerCase().includes(matchers.director)) return true;
          if (matchers.genre && m.Genre?.toLowerCase().includes(matchers.genre)) return true;
          return false;
        })
      : detailed;

    fieldFiltered = fieldFiltered.slice(0, limit);

    setResults(fieldFiltered);
    setLoading(false);
  };

  const filteredResults = results.filter((m) => {
    const year = parseInt(m.Year?.slice(0, 4) || "0");
    if (yearFrom && year < parseInt(yearFrom)) return false;
    if (yearTo && year > parseInt(yearTo)) return false;
    if (minRating) {
      const r = parseFloat(m.imdbRating || "0");
      if (isNaN(r) || r < parseFloat(minRating)) return false;
    }
    return true;
  });

  const clearAll = () => {
    setTitleQuery("");
    setActorQuery("");
    setDirectorQuery("");
    setGenreQuery("");
    setYearFrom("");
    setYearTo("");
    setMinRating("");
    setResultLimit("20");
  };

  const hasAnyInput =
    titleQuery || actorQuery || directorQuery || genreQuery || yearFrom || yearTo || minRating;

  return (
    <div className="pt-20 pb-10 container space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-foreground">Search Movies</h1>
        <Button variant="outline" onClick={() => setShowFilters((s) => !s)} className="border-border">
          <SlidersHorizontal size={18} className="mr-2" /> Filters
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Fill any of the fields below — results match if <span className="text-foreground font-medium">any</span> filled field matches.
      </p>

      <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Title</Label>
            <Input
              placeholder="e.g. Inception"
              value={titleQuery}
              onChange={(e) => setTitleQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Actor (comma-separated for multiple)</Label>
            <Input
              placeholder="e.g. Tom Hanks, Meg Ryan"
              value={actorQuery}
              onChange={(e) => setActorQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Director</Label>
            <Input
              placeholder="e.g. Christopher Nolan"
              value={directorQuery}
              onChange={(e) => setDirectorQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Genre</Label>
            <Input
              placeholder="e.g. Sci-Fi"
              value={genreQuery}
              onChange={(e) => setGenreQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-background border-border"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} className="bg-primary text-primary-foreground hover:opacity-90 flex-1 sm:flex-none">
            <Search size={18} className="mr-2" /> Search
          </Button>
          {hasAnyInput && (
            <Button variant="ghost" onClick={clearAll} className="text-muted-foreground">
              <X size={14} className="mr-1" /> Clear all
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-4">
          <h3 className="font-display font-semibold text-foreground">Additional filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {!loading && results.length === 0 && hasAnyInput && (
        <p className="text-center text-muted-foreground py-10">No movies found. Try different fields or filters.</p>
      )}
      {!loading && results.length > 0 && filteredResults.length === 0 && (
        <p className="text-center text-muted-foreground py-10">No results match your filters.</p>
      )}
    </div>
  );
}
