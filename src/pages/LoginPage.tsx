import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ALL_GENRES } from "@/lib/userStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Sign in state
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign up state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSignIn = () => {
    if (!signInUsername.trim() || !signInPassword) return;
    const result = signIn(signInUsername.trim(), signInPassword);
    if (result.ok === true) {
      sessionStorage.removeItem("cineai_watchlater_prompted");
      toast.success(`Welcome back, ${result.profile.username}!`);
    } else {
      toast.error(result.error);
    }
  };

  const handleSignUp = () => {
    if (!username.trim() || !password || selectedGenres.length === 0) return;
    const result = signUp(username.trim(), password, selectedGenres);
    if (result.ok === true) {
      sessionStorage.removeItem("cineai_watchlater_prompted");
      toast.success(`Account created. Welcome, ${result.profile.username}!`);
    } else {
      toast.error(result.error);
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

        <div className="glass-card rounded-xl p-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6 mt-0">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Username</label>
                <Input
                  placeholder="Your username"
                  value={signInUsername}
                  onChange={(e) => setSignInUsername(e.target.value)}
                  className="bg-secondary border-border focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="Your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                  className="bg-secondary border-border focus:ring-primary"
                />
              </div>
              <Button
                onClick={handleSignIn}
                disabled={!signInUsername.trim() || !signInPassword}
                className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold"
              >
                Sign In
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                New here?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline"
                >
                  Create an account
                </button>
              </p>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6 mt-0">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Username</label>
                <Input
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-secondary border-border focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="Choose a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                onClick={handleSignUp}
                disabled={!username.trim() || !password || selectedGenres.length === 0}
                className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold"
              >
                Create Account
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
