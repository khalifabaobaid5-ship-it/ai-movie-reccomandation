import { Movie } from "@/lib/omdb";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  userRating?: number;
}

export function MovieCard({ movie, userRating }: MovieCardProps) {
  const navigate = useNavigate();
  const poster = movie.Poster !== "N/A" ? movie.Poster : "/placeholder.svg";

  return (
    <div
      onClick={() => navigate(`/movie/${movie.imdbID}`)}
      className="group cursor-pointer rounded-lg overflow-hidden bg-card card-glow animate-fade-in"
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={poster}
          alt={movie.Title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
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
