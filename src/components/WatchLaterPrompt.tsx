import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { WatchLaterItem } from "@/lib/userStore";
import { toast } from "sonner";

const SESSION_FLAG = "cineai_watchlater_prompted";

export function WatchLaterPrompt() {
  const { user, rate, addWatch } = useAuth();
  const [open, setOpen] = useState(false);
  const [queue, setQueue] = useState<WatchLaterItem[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [review, setReview] = useState("");
  const [showRating, setShowRating] = useState(false);

  // Build the queue once per session, when the user logs in.
  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem(SESSION_FLAG)) return;

    const pending = user.watchLater.filter((m) => !user.ratings[m.imdbID]);
    if (pending.length === 0) {
      sessionStorage.setItem(SESSION_FLAG, "1");
      return;
    }
    setQueue(pending);
    setIndex(0);
    setScore(0);
    setReview("");
    setShowRating(false);
    setOpen(true);
    sessionStorage.setItem(SESSION_FLAG, "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username]);

  const current = queue[index];
  const remaining = useMemo(() => queue.length - index, [queue.length, index]);

  if (!current) return null;

  const advance = () => {
    setScore(0);
    setReview("");
    setShowRating(false);
    if (index + 1 >= queue.length) {
      setOpen(false);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const handleWatched = () => {
    // Record in watch history, then ask for a rating
    addWatch({
      imdbID: current.imdbID,
      title: current.title,
      poster: current.poster,
      genre: current.genre || "",
      year: current.year,
    });
    setShowRating(true);
  };

  const handleSaveRating = () => {
    if (score === 0) return;
    rate(current.imdbID, score, review);
    toast.success(`Rated "${current.title}"`);
    advance();
  };

  const poster = current.poster && current.poster !== "N/A" ? current.poster : "/placeholder.svg";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Welcome back!</DialogTitle>
          <DialogDescription>
            You have {remaining} movie{remaining === 1 ? "" : "s"} in your Watch Later list. Did you watch this one?
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4">
          <img
            src={poster}
            alt={current.title}
            className="w-24 h-36 object-cover rounded-md shadow-md flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
          <div className="space-y-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground truncate">{current.title}</h3>
            <p className="text-sm text-muted-foreground">{current.year}</p>
            {current.genre && (
              <p className="text-xs text-muted-foreground line-clamp-2">{current.genre}</p>
            )}
            <p className="text-xs text-muted-foreground pt-1">
              Added {new Date(current.addedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {showRating && (
          <div className="space-y-3 pt-2 border-t border-border">
            <p className="text-sm text-foreground">Rate it:</p>
            <StarRating rating={score} onRate={setScore} size={22} />
            <Textarea
              placeholder="Quick review (optional)..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="bg-secondary border-border"
              rows={2}
            />
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
          {showRating ? (
            <>
              <Button variant="ghost" onClick={advance} className="w-full sm:w-auto">
                Skip rating
              </Button>
              <Button
                onClick={handleSaveRating}
                disabled={score === 0}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:opacity-90"
              >
                Save rating
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={advance} className="w-full sm:w-auto">
                Not yet
              </Button>
              <Button
                onClick={handleWatched}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:opacity-90"
              >
                Yes, I watched it
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
