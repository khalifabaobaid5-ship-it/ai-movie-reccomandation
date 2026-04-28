import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { searchByGenre, Movie } from "@/lib/omdb";
import { MovieCard } from "@/components/MovieCard";
import { Sparkles } from "lucide-react";

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const genreResults = await Promise.all(
          user.favoriteGenres.slice(0, 5).flatMap((g) => [
            searchByGenre(g, 1),
            searchByGenre(g, 2),
          ])
        );
        const allRecs = genreResults.flatMap((r) => r.Search || []);
        const uniqueRecs = Array.from(new Map(allRecs.map((m) => [m.imdbID, m])).values());
        // Prefer movies that have a poster image
        const sortedRecs = uniqueRecs.sort((a, b) => {
          const aHas = a.Poster && a.Poster !== "N/A" ? 0 : 1;
          const bHas = b.Poster && b.Poster !== "N/A" ? 0 : 1;
          return aHas - bHas;
        });
        setRecommendations(sortedRecs.slice(0, 30));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user) return null;

  return (
    <div className="pt-20 pb-10 container space-y-6">
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={22} />
          <h1 className="text-3xl font-display font-bold text-foreground">Recommended For You</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Based on your favorite genres: {user.favoriteGenres.join(", ") || "none yet"}
        </p>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center">
            Pick favorite genres in your Profile to see recommendations.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recommendations.map((m) => (
              <MovieCard key={m.imdbID} movie={m} userRating={user.ratings[m.imdbID]?.score} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
