import { useAuth } from "@/contexts/AuthContext";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="pt-20 pb-10 container space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="text-primary" size={22} />
        <h1 className="text-3xl font-display font-bold text-foreground">Watch History</h1>
      </div>

      {user.watchHistory.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No movies watched yet. Start exploring!</p>
      ) : (
        <div className="space-y-3">
          {user.watchHistory.map((item) => {
            const poster = item.poster !== "N/A" ? item.poster : "/placeholder.svg";
            const rating = user.ratings[item.imdbID];
            return (
              <div
                key={item.imdbID}
                onClick={() => navigate(`/movie/${item.imdbID}`)}
                className="glass-card rounded-lg p-4 flex gap-4 cursor-pointer hover:border-primary/30 transition-colors animate-fade-in"
              >
                <img src={poster} alt={item.title} className="w-16 h-24 rounded object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground truncate">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.year} • {item.genre}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Watched {new Date(item.watchedAt).toLocaleDateString()}
                  </p>
                  {rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={12} className="fill-star-filled text-star-filled" />
                      <span className="text-xs text-primary">{rating.score}/10</span>
                      {rating.review && <span className="text-xs text-muted-foreground ml-2 truncate">"{rating.review}"</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
