import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ALL_GENRES } from "@/lib/userStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenres, setCustomGenres] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const addCustomGenre = () => {
    const g = customInput.trim();
    if (!g) return;
    const exists = [...ALL_GENRES, ...customGenres].some((x) => x.toLowerCase() === g.toLowerCase());
    if (!exists) {
      setCustomGenres((prev) => [...prev, g]);
    }
    if (!selectedGenres.some((x) => x.toLowerCase() === g.toLowerCase())) {
      setSelectedGenres((prev) => [...prev, g]);
    }
    setCustomInput("");
  };

  const removeCustomGenre = (g: string) => {
    setCustomGenres((prev) => prev.filter((x) => x !== g));
    setSelectedGenres((prev) => prev.filter((x) => x !== g));
  };

  const handleLogin = () => {
    if (username.trim() && selectedGenres.length > 0) {
      login(username.trim(), selectedGenres);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary card-glow">
            <Film size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gradient-gold">CineAI</h1>
          <p className="text-muted-foreground">Your AI-powered movie companion</p>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Username</label>
            <Input
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-secondary border-border focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Favorite Genres <span className="text-muted-foreground text-xs">(select at least 1)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                    selectedGenres.includes(g)
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
                  className={cn(
                    "inline-flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full text-sm font-medium transition-all",
                    selectedGenres.includes(g)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <button onClick={() => toggleGenre(g)} className="focus:outline-none">
                    {g}
                  </button>
                  <button
                    onClick={() => removeCustomGenre(g)}
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
          </div>

          <Button
            onClick={handleLogin}
            disabled={!username.trim() || selectedGenres.length === 0}
            className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
