import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ALL_GENRES } from "@/lib/userStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

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
