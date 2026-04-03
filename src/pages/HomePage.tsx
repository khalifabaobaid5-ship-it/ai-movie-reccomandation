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
        // Get recommendations based on favorite genres
        const genreResults = await Promise.all(
          user.favoriteGenres.slice(0, 3).map((g) => searchByGenre(g))
        );
        const allMovies = genreResults.flatMap((r) => r.Search || []);
        // Deduplicate and pick 5
        const unique = Array.from(new Map(allMovies.map((m) => [m.imdbID, m])).values());
        setRecommendations(unique.slice(0, 5));

        // Get trending (popular search)
        const trendRes = await searchByGenre("Adventure");
        setTrending((trendRes.Search || []).slice(0, 8));
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
            {[...Array(5)].map((_, i) => (
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trending.map((m) => (
              <MovieCard key={m.imdbID} movie={m} userRating={user.ratings[m.imdbID]?.score} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
