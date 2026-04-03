import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMovieById, searchMovies, Movie } from "@/lib/omdb";
import { useAuth } from "@/contexts/AuthContext";
import { StarRating } from "@/components/StarRating";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Clock, Star, Film, Users } from "lucide-react";
import { toast } from "sonner";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, addWatch, rate } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [review, setReview] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const data = await getMovieById(id);
      if (data.Response === "True") {
        setMovie(data);
        // Add to watch history
        if (user) {
          addWatch({
            imdbID: data.imdbID,
            title: data.Title,
            poster: data.Poster,
            genre: data.Genre || "",
            year: data.Year,
          });
        }
        // Load existing rating
        if (user?.ratings[id]) {
          setScore(user.ratings[id].score);
          setReview(user.ratings[id].review);
        }
        // Find similar movies
        const firstGenre = (data.Genre || "").split(",")[0]?.trim();
        if (firstGenre) {
          const res = await searchMovies(firstGenre);
          setSimilar((res.Search || []).filter((m) => m.imdbID !== id).slice(0, 4));
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleRate = () => {
    if (!id || score === 0) return;
    rate(id, score, review);
    toast.success("Rating saved!");
  };

  if (loading) {
    return (
      <div className="pt-20 pb-10 container">
        <div className="h-96 bg-secondary rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="pt-20 pb-10 container text-center text-muted-foreground">Movie not found.</div>
    );
  }

  const poster = movie.Poster !== "N/A" ? movie.Poster : "/placeholder.svg";
  const googleLink = `https://www.google.com/search?q=${encodeURIComponent(movie.Title + " " + movie.Year + " movie")}`;

  return (
    <div className="pt-20 pb-10 container space-y-10">
      {/* Movie Hero */}
      <div className="glass-card rounded-xl p-6 md:p-8 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-8">
          <img
            src={poster}
            alt={movie.Title}
            className="w-48 md:w-64 rounded-lg shadow-lg mx-auto md:mx-0"
          />
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{movie.Title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span>{movie.Year}</span>
                {movie.Runtime && <span>• {movie.Runtime}</span>}
                {movie.Rated && <span>• {movie.Rated}</span>}
              </div>
            </div>

            {movie.Genre && (
              <div className="flex flex-wrap gap-2">
                {movie.Genre.split(",").map((g) => (
                  <span key={g} className="px-2 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
                    {g.trim()}
                  </span>
                ))}
              </div>
            )}

            {movie.imdbRating && movie.imdbRating !== "N/A" && (
              <div className="flex items-center gap-2">
                <Star size={18} className="fill-star-filled text-star-filled" />
                <span className="text-lg font-semibold text-primary">{movie.imdbRating}/10</span>
                <span className="text-sm text-muted-foreground">IMDb</span>
              </div>
            )}

            {movie.Plot && <p className="text-sm text-muted-foreground leading-relaxed">{movie.Plot}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {movie.Director && (
                <div className="flex items-center gap-2">
                  <Film size={14} className="text-primary" />
                  <span className="text-muted-foreground">Director:</span>
                  <span className="text-foreground">{movie.Director}</span>
                </div>
              )}
              {movie.Actors && (
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-primary" />
                  <span className="text-muted-foreground">Cast:</span>
                  <span className="text-foreground truncate">{movie.Actors}</span>
                </div>
              )}
            </div>

            <a href={googleLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 border-border text-muted-foreground hover:text-foreground hover:bg-secondary">
                <ExternalLink size={14} /> View on Google
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Rating Section */}
      <div className="glass-card rounded-xl p-6 space-y-4 animate-fade-in">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <Star size={20} className="text-primary" /> Rate This Movie
        </h2>
        <StarRating rating={score} onRate={setScore} size={24} />
        <Textarea
          placeholder="Write a review (optional)..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="bg-secondary border-border"
          rows={3}
        />
        <Button onClick={handleRate} disabled={score === 0} className="bg-primary text-primary-foreground hover:opacity-90">
          Save Rating
        </Button>
      </div>

      {/* Similar Movies */}
      {similar.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold text-foreground">Similar Movies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {similar.map((m) => (
              <MovieCard key={m.imdbID} movie={m} userRating={user?.ratings[m.imdbID]?.score} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
