import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bookmark, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WatchLaterPage() {
  const { user, removeWatchLater } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const items = user.watchLater;

  return (
    <div className="pt-20 pb-10 container space-y-6">
      <div className="flex items-center gap-2">
        <Bookmark className="text-primary" size={22} />
        <h1 className="text-3xl font-display font-bold text-foreground">Watch Later</h1>
        {items.length > 0 && (
          <span className="text-sm text-muted-foreground">({items.length})</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-muted-foreground">Your Watch Later list is empty.</p>
          <p className="text-sm text-muted-foreground">
            Hover any movie poster and tap the bookmark icon to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((m) => {
            const poster = m.poster && m.poster !== "N/A" ? m.poster : "/placeholder.svg";
            return (
              <div
                key={m.imdbID}
                onClick={() => navigate(`/movie/${m.imdbID}`)}
                className="group relative cursor-pointer rounded-lg overflow-hidden bg-card card-glow animate-fade-in"
              >
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWatchLater(m.imdbID);
                    toast("Removed from Watch Later");
                  }}
                  aria-label="Remove"
                  className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/70 backdrop-blur text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X size={14} />
                </Button>
                <div className="aspect-[2/3] overflow-hidden">
                  <img
                    src={poster}
                    alt={m.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-display text-sm font-semibold text-foreground truncate">{m.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{m.year}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(m.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {m.genre && (
                    <p className="text-xs text-muted-foreground truncate">{m.genre}</p>
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
