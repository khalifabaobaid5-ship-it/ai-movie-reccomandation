import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ALL_GENRES } from "@/lib/userStore";
import { getMovieById, Movie } from "@/lib/omdb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Sparkles, Plus, X, Save, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, setGenres } = useAuth();
  const [selected, setSelected] = useState<string[]>(user?.favoriteGenres ?? []);
  const [customInput, setCustomInput] = useState("");
  const [ratedMovies, setRatedMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  useEffect(() => {
    setSelected(user?.favoriteGenres ?? []);
  }, [user?.favoriteGenres]);

  // Fetch full info for rated movies for richer summary
  useEffect(() => {
    if (!user) return;
    const ids = Object.keys(user.ratings);
    if (ids.length === 0) {
      setRatedMovies([]);
      return;
    }
    setLoadingMovies(true);
    Promise.all(ids.map((id) => getMovieById(id)))
      .then((res) => setRatedMovies(res.filter((r) => r.Response === "True") as Movie[]))
      .finally(() => setLoadingMovies(false));
  }, [user?.ratings]);

  const summary = useMemo(() => {
    if (!user) return null;
    const ratings = Object.values(user.ratings);
    if (ratings.length === 0) {
      return {
        intro: "Not enough data yet to build your taste profile.",
        bullets: ["Rate a few movies and your AI summary will appear here."],
      };
    }

    const avgScore =
      ratings.reduce((s, r) => s + r.score, 0) / ratings.length;

    // Tally genres, directors, actors, decades from rated movies
    const genreScores = new Map<string, { total: number; count: number }>();
    const directorScores = new Map<string, { total: number; count: number }>();
    const actorScores = new Map<string, { total: number; count: number }>();
    const decadeCounts = new Map<string, number>();

    ratedMovies.forEach((m) => {
      const r = user.ratings[m.imdbID];
      if (!r) return;
      m.Genre?.split(",").map((g) => g.trim()).filter(Boolean).forEach((g) => {
        const cur = genreScores.get(g) ?? { total: 0, count: 0 };
        genreScores.set(g, { total: cur.total + r.score, count: cur.count + 1 });
      });
      m.Director?.split(",").map((d) => d.trim()).filter((d) => d && d !== "N/A").forEach((d) => {
        const cur = directorScores.get(d) ?? { total: 0, count: 0 };
        directorScores.set(d, { total: cur.total + r.score, count: cur.count + 1 });
      });
      m.Actors?.split(",").map((a) => a.trim()).filter((a) => a && a !== "N/A").forEach((a) => {
        const cur = actorScores.get(a) ?? { total: 0, count: 0 };
        actorScores.set(a, { total: cur.total + r.score, count: cur.count + 1 });
      });
      const yr = parseInt(m.Year?.slice(0, 4) || "0");
      if (yr) {
        const decade = `${Math.floor(yr / 10) * 10}s`;
        decadeCounts.set(decade, (decadeCounts.get(decade) ?? 0) + 1);
      }
    });

    const topBy = (m: Map<string, { total: number; count: number }>, n: number) =>
      [...m.entries()]
        .map(([k, v]) => ({ name: k, avg: v.total / v.count, count: v.count }))
        .sort((a, b) => b.avg * b.count - a.avg * a.count)
        .slice(0, n);

    const topGenres = topBy(genreScores, 3);
    const topDirectors = topBy(directorScores, 2);
    const topActors = topBy(actorScores, 3);
    const topDecade = [...decadeCounts.entries()].sort((a, b) => b[1] - a[1])[0];

    const taste =
      avgScore >= 8
        ? "an enthusiastic viewer who scores generously"
        : avgScore >= 6
        ? "a balanced critic with a clear sense of quality"
        : "a tough critic who reserves high scores for standouts";

    const bullets: string[] = [];
    if (topGenres.length)
      bullets.push(
        `Your strongest genres are ${topGenres.map((g) => `${g.name} (avg ${g.avg.toFixed(1)})`).join(", ")}.`
      );
    if (topDirectors.length)
      bullets.push(
        `You consistently rate work by ${topDirectors.map((d) => d.name).join(" and ")} highly.`
      );
    if (topActors.length)
      bullets.push(`Recurring favorite cast: ${topActors.map((a) => a.name).join(", ")}.`);
    if (topDecade) bullets.push(`Most of your rated films come from the ${topDecade[0]}.`);
    bullets.push(
      `Across ${ratings.length} rating${ratings.length === 1 ? "" : "s"}, your average score is ${avgScore.toFixed(1)}/10.`
    );

    return {
      intro: `${user.username}, you're ${taste}.`,
      bullets,
    };
  }, [user, ratedMovies]);

  if (!user) return null;

  const toggleGenre = (g: string) =>
    setSelected((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const addCustomGenre = () => {
    const g = customInput.trim();
    if (!g) return;
    if (!selected.some((x) => x.toLowerCase() === g.toLowerCase())) {
      setSelected((prev) => [...prev, g]);
    }
    setCustomInput("");
  };

  const customGenres = selected.filter(
    (g) => !ALL_GENRES.some((x) => x.toLowerCase() === g.toLowerCase())
  );

  const saveGenres = () => {
    if (selected.length === 0) {
      toast.error("Pick at least one genre");
      return;
    }
    setGenres(selected);
    toast.success("Favorite genres updated");
  };

  const dirty =
    selected.length !== user.favoriteGenres.length ||
    selected.some((g) => !user.favoriteGenres.includes(g));

  return (
    <div className="pt-20 pb-10 container space-y-8 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center card-glow">
          <User size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">{user.username}</h1>
          <p className="text-sm text-muted-foreground">
            {Object.keys(user.ratings).length} rating
            {Object.keys(user.ratings).length === 1 ? "" : "s"} · {user.watchLater.length} on Watch Later
          </p>
        </div>
      </div>

      {/* AI Summary */}
      <section className="glass-card rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={18} />
          <h2 className="font-display text-xl font-bold text-foreground">Your AI Taste Summary</h2>
        </div>
        {loadingMovies && ratedMovies.length === 0 && Object.keys(user.ratings).length > 0 ? (
          <div className="space-y-2">
            <div className="h-4 w-2/3 bg-secondary rounded animate-pulse" />
            <div className="h-3 w-full bg-secondary rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-secondary rounded animate-pulse" />
          </div>
        ) : summary ? (
          <>
            <p className="text-foreground/90 leading-relaxed">{summary.intro}</p>
            <ul className="space-y-1.5">
              {summary.bullets.map((b, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <Star size={12} className="mt-1 shrink-0 fill-star-filled text-star-filled" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      {/* Editable favorite genres */}
      <section className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">Favorite Genres</h2>
          <Button
            onClick={saveGenres}
            disabled={!dirty}
            size="sm"
            className="bg-primary text-primary-foreground hover:opacity-90 gap-1.5"
          >
            <Save size={14} /> Save
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_GENRES.map((g) => (
            <button
              key={g}
              onClick={() => toggleGenre(g)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                selected.includes(g)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {g}
            </button>
          ))}
          {customGenres.map((g) => (
            <span
              key={g}
              className="inline-flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground"
            >
              {g}
              <button
                onClick={() => toggleGenre(g)}
                aria-label={`Remove ${g}`}
                className="ml-1 rounded-full p-0.5 hover:bg-background/20"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <Input
            placeholder="Add your own genre"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomGenre();
              }
            }}
            className="bg-secondary border-border focus:ring-primary"
          />
          <Button
            type="button"
            onClick={addCustomGenre}
            disabled={!customInput.trim()}
            variant="secondary"
            className="shrink-0"
          >
            <Plus size={16} />
          </Button>
        </div>
      </section>
    </div>
  );
}
