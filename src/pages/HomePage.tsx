import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { searchByGenre, searchByYear, Movie } from "@/lib/omdb";
import { MovieCard } from "@/components/MovieCard";
import { TrendingUp, CalendarClock } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [latest, setLatest] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {

        // Trending: combine multiple popular genres for variety
        const trendingGenres = ["Adventure", "Action", "Drama"];
        const trendResults = await Promise.all(
          trendingGenres.flatMap((g) => [searchByGenre(g, 1), searchByGenre(g, 2)])
        );
        const allTrend = trendResults.flatMap((r) => r.Search || []);
        const uniqueTrend = Array.from(new Map(allTrend.map((m) => [m.imdbID, m])).values());
        const sortedTrend = uniqueTrend.sort((a, b) => {
          const aHas = a.Poster && a.Poster !== "N/A" ? 0 : 1;
          const bHas = b.Poster && b.Poster !== "N/A" ? 0 : 1;
          return aHas - bHas;
        });
        setTrending(sortedTrend.slice(0, 24));

        // Latest releases: pull from the past few years and sort by year desc
        const currentYear = new Date().getFullYear();
        const years = [currentYear, currentYear - 1, currentYear - 2];
        const latestResults = await Promise.all(
          years.flatMap((y) => [searchByYear(y, 1), searchByYear(y, 2)])
        );
        const allLatest = latestResults.flatMap((r) => r.Search || []);
        const uniqueLatest = Array.from(new Map(allLatest.map((m) => [m.imdbID, m])).values());
        const sortedLatest = uniqueLatest
          .filter((m) => m.Poster && m.Poster !== "N/A")
          .sort((a, b) => {
            const ay = parseInt(a.Year, 10) || 0;
            const by = parseInt(b.Year, 10) || 0;
            return by - ay;
          });
        setLatest(sortedLatest.slice(0, 20));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user) return null;

  return (
    <div className="pt-20 pb-10 container space-y-10">

      {/* Latest Releases */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="text-primary" size={22} />
          <h2 className="text-2xl font-display font-bold text-foreground">Latest Releases</h2>
        </div>
        <p className="text-sm text-muted-foreground">Newest movies by release year</p>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {latest.map((m) => (
              <MovieCard key={m.imdbID} movie={m} userRating={user.ratings[m.imdbID]?.score} />
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary" size={22} />
          <h2 className="text-2xl font-display font-bold text-foreground">Popular Movies</h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {trending.map((m) => (
              <MovieCard key={m.imdbID} movie={m} userRating={user.ratings[m.imdbID]?.score} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
