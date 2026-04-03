import { useAuth } from "@/contexts/AuthContext";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StarRating } from "@/components/StarRating";

export default function RatingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const ratings = Object.values(user.ratings).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const watchItem = (id: string) => user.watchHistory.find((h) => h.imdbID === id);

  return (
    <div className="pt-20 pb-10 container space-y-6">
      <div className="flex items-center gap-2">
        <Star className="text-primary" size={22} />
        <h1 className="text-3xl font-display font-bold text-foreground">My Ratings</h1>
      </div>

      {ratings.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No ratings yet. Rate some movies!</p>
      ) : (
        <div className="space-y-3">
          {ratings.map((r) => {
            const item = watchItem(r.imdbID);
            const poster = item?.poster && item.poster !== "N/A" ? item.poster : "/placeholder.svg";
            return (
              <div
                key={r.imdbID}
                onClick={() => navigate(`/movie/${r.imdbID}`)}
                className="glass-card rounded-lg p-4 flex gap-4 cursor-pointer hover:border-primary/30 transition-colors animate-fade-in"
              >
                <img src={poster} alt={item?.title || r.imdbID} className="w-16 h-24 rounded object-cover" loading="lazy" />
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-display font-semibold text-foreground truncate">
                    {item?.title || r.imdbID}
                  </h3>
                  <StarRating rating={r.score} readonly size={14} />
                  {r.review && <p className="text-sm text-muted-foreground">"{r.review}"</p>}
                  <p className="text-xs text-muted-foreground">
                    Rated {new Date(r.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
