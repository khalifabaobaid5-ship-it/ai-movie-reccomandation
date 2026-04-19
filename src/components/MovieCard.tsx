import { Movie } from "@/lib/omdb";
import { useNavigate } from "react-router-dom";
import { Star, Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MovieCardProps {
  movie: Movie;
  userRating?: number;
}

export function MovieCard({ movie, userRating }: MovieCardProps) {
  const navigate = useNavigate();
  const { user, addWatchLater, removeWatchLater } = useAuth();
  const poster = movie.Poster !== "N/A" ? movie.Poster : "/placeholder.svg";
  const inWatchLater = !!user?.watchLater.some((w) => w.imdbID === movie.imdbID);

  const toggleWatchLater = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchLater) {
      removeWatchLater(movie.imdbID);
      toast("Removed from Watch Later");
    } else {
      addWatchLater({
        imdbID: movie.imdbID,
        title: movie.Title,
        poster: movie.Poster,
        year: movie.Year,
        genre: movie.Genre,
      });
      toast.success("Added to Watch Later");
    }
  };

  return (
    <div
      onClick={() => navigate(`/movie/${movie.imdbID}`)}
      className="group relative cursor-pointer rounded-lg overflow-hidden bg-card card-glow animate-fade-in"
    >
      <button
        onClick={toggleWatchLater}
        aria-label={inWatchLater ? "Remove from Watch Later" : "Add to Watch Later"}
        className="absolute top-2 right-2 z-10 rounded-full bg-background/70 backdrop-blur p-2 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
      >
        {inWatchLater ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
      </button>
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={poster}
          alt={movie.Title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
        />
      </div>
      <div className="p-3 space-y-1">
        <h3 className="font-display text-sm font-semibold text-foreground truncate">{movie.Title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{movie.Year}</span>
          {(movie.imdbRating || userRating) && (
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-star-filled text-star-filled" />
              <span className="text-xs text-primary">{userRating || movie.imdbRating}</span>
            </div>
          )}
        </div>
        {movie.Genre && (
          <p className="text-xs text-muted-foreground truncate">{movie.Genre}</p>
        )}
      </div>
    </div>
  );
}
