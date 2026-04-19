import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { searchByGenre, Movie } from "@/lib/omdb";
import { MovieCard } from "@/components/MovieCard";
import { Sparkles, TrendingUp } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        // Recommendations: pull from up to 5 favorite genres, 2 pages each
        const genreResults = await Promise.all(
          user.favoriteGenres.slice(0, 5).flatMap((g) => [
            searchByGenre(g, 1),
            searchByGenre(g, 2),
          ])
        );
        const allRecs = genreResults.flatMap((r) => r.Search || []);
        const uniqueRecs = Array.from(new Map(allRecs.map((m) => [m.imdbID, m])).values());
        setRecommendations(uniqueRecs.slice(0, 20));

        // Trending: combine multiple popular genres for variety
        const trendingGenres = ["Adventure", "Action", "Drama"];
        const trendResults = await Promise.all(
          trendingGenres.flatMap((g) => [searchByGenre(g, 1), searchByGenre(g, 2)])
        );
        const allTrend = trendResults.flatMap((r) => r.Search || []);
        const uniqueTrend = Array.from(new Map(allTrend.map((m) => [m.imdbID, m])).values());
        setTrending(uniqueTrend.slice(0, 24));
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
      {/* Recommendations */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={22} />
          <h2 className="text-2xl font-display font-bold text-foreground">Recommended For You</h2>
        </div>
        <p className="text-sm text-muted-foreground">Based on your favorite genres: {user.favoriteGenres.join(", ")}</p>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recommendations.map((m) => (
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
