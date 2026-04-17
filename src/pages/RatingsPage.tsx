import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Calendar, Clock, Film as FilmIcon, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StarRating } from "@/components/StarRating";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMovieById, Movie } from "@/lib/omdb";

export default function RatingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);
  const [details, setDetails] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const ratings = Object.values(user.ratings).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const watchItem = (id: string) => user.watchHistory.find((h) => h.imdbID === id);

  const openMovie = async (id: string) => {
    setOpenId(id);
    setDetails(null);
    setLoading(true);
    const data = await getMovieById(id);
    if (data.Response === "True") setDetails(data);
    setLoading(false);
  };

  const activeRating = openId ? user.ratings[openId] : null;
  const poster = details?.Poster && details.Poster !== "N/A" ? details.Poster : "/placeholder.svg";

  return (
    <div className="pt-20 pb-10 container space-y-6">
      <div className="flex items-center gap-2">
        <Star className="text-primary" size={22} />
        <h1 className="text-3xl font-display font-bold text-foreground">My Ratings</h1>
      </div>

      {ratings.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No ratings yet. Rate some movies!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {ratings.map((r) => {
            const item = watchItem(r.imdbID);
            const tilePoster = item?.poster && item.poster !== "N/A" ? item.poster : "/placeholder.svg";
            return (
              <div
                key={r.imdbID}
                onClick={() => openMovie(r.imdbID)}
                className="group cursor-pointer rounded-lg overflow-hidden bg-card card-glow animate-fade-in"
              >
                <div className="aspect-[2/3] overflow-hidden">
                  <img
                    src={tilePoster}
                    alt={item?.title || r.imdbID}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                </div>
                <div className="p-3 space-y-1.5">
                  <h3 className="font-display text-sm font-semibold text-foreground truncate">
                    {item?.title || r.imdbID}
                  </h3>
                  <StarRating rating={r.score} readonly size={12} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          {loading || !details ? (
            <div className="space-y-4">
              <div className="h-6 w-2/3 bg-secondary rounded animate-pulse" />
              <div className="flex gap-4">
                <div className="w-32 h-48 bg-secondary rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-secondary rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-secondary rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-secondary rounded animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-foreground pr-8">
                  {details.Title} <span className="text-muted-foreground font-normal">({details.Year})</span>
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={poster}
                  alt={details.Title}
                  className="w-full sm:w-40 h-auto sm:h-60 rounded object-cover self-center sm:self-start"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex flex-wrap gap-2">
                    {details.Rated && details.Rated !== "N/A" && (
                      <Badge variant="outline" className="border-border">{details.Rated}</Badge>
                    )}
                    {details.Runtime && details.Runtime !== "N/A" && (
                      <Badge variant="outline" className="border-border gap-1">
                        <Clock size={10} /> {details.Runtime}
                      </Badge>
                    )}
                    {details.imdbRating && details.imdbRating !== "N/A" && (
                      <Badge variant="outline" className="border-border gap-1">
                        <Star size={10} className="fill-star-filled text-star-filled" /> {details.imdbRating}
                      </Badge>
                    )}
                  </div>

                  {details.Genre && details.Genre !== "N/A" && (
                    <div className="flex flex-wrap gap-1.5">
                      {details.Genre.split(",").map((g) => (
                        <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {g.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {details.Plot && details.Plot !== "N/A" && (
                    <p className="text-sm text-foreground/90 leading-relaxed">{details.Plot}</p>
                  )}

                  <div className="space-y-1 text-sm">
                    {details.Director && details.Director !== "N/A" && (
                      <p className="text-muted-foreground">
                        <span className="text-foreground font-medium">Director:</span> {details.Director}
                      </p>
                    )}
                    {details.Actors && details.Actors !== "N/A" && (
                      <p className="text-muted-foreground">
                        <span className="text-foreground font-medium">Cast:</span> {details.Actors}
                      </p>
                    )}
                    {details.Released && details.Released !== "N/A" && (
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <Calendar size={12} /> {details.Released}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {activeRating && (
                <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Your rating</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activeRating.date).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={activeRating.score} readonly size={18} />
                  {activeRating.review && (
                    <p className="text-sm text-foreground/90 italic">"{activeRating.review}"</p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => navigate(`/movie/${openId}`)}
                  className="bg-primary text-primary-foreground hover:opacity-90 gap-2"
                >
                  <ExternalLink size={14} /> View full page
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
