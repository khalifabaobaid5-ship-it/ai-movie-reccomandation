import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Film, Star, LogOut, User, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Film, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/watch-later", icon: Bookmark, label: "Watch Later" },
  { to: "/ratings", icon: Star, label: "My Ratings" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function AppNav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="font-display text-xl font-bold text-gradient-gold">
          CineAI
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary",
                  location.pathname === to && "text-primary bg-secondary"
                )}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Hi, <span className="text-foreground">{user.username}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </nav>
  );
}
