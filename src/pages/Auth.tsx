import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GridItem {
  index: number;
  isActive: boolean;
  isTraced: boolean;
  animationDelay: string;
}

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const gridRef = useRef<HTMLDivElement>(null);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate grid size based on window
  const calculateGrid = useCallback(() => {
    const itemSize = window.innerWidth > 768 ? 60 : window.innerWidth > 480 ? 50 : 45;
    const gap = 2;
    const cols = Math.floor(window.innerWidth / (itemSize + gap));
    const rows = Math.floor(window.innerHeight / (itemSize + gap));
    const total = cols * rows;

    const items: GridItem[] = [];
    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / cols);
      items.push({
        index: i,
        isActive: false,
        isTraced: false,
        animationDelay: `${row * 0.1}s`,
      });
    }
    setGridItems(items);
  }, []);

  useEffect(() => {
    calculateGrid();
    window.addEventListener("resize", calculateGrid);
    return () => window.removeEventListener("resize", calculateGrid);
  }, [calculateGrid]);

  // Auth state check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Mouse tracking for grid effect
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (gridRef.current) {
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const hoveredIndices = new Set<number>();

      elements.forEach(el => {
        const index = el.getAttribute("data-grid-index");
        if (index) hoveredIndices.add(parseInt(index));
      });

      // Also check nearby cells
      [-30, 0, 30].forEach(dx => {
        [-30, 0, 30].forEach(dy => {
          const nearbyElements = document.elementsFromPoint(e.clientX + dx, e.clientY + dy);
          nearbyElements.forEach(el => {
            const index = el.getAttribute("data-grid-index");
            if (index) hoveredIndices.add(parseInt(index));
          });
        });
      });

      setGridItems(prev => prev.map(item => ({
        ...item,
        isActive: hoveredIndices.has(item.index),
        isTraced: hoveredIndices.has(item.index) || item.isTraced,
      })));

      // Clear traced state after delay
      setTimeout(() => {
        setGridItems(prev => prev.map(item => ({
          ...item,
          isTraced: hoveredIndices.has(item.index) ? item.isTraced : false,
        })));
      }, 2000);
    }
  }, []);

  const handleContainerEnter = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
    setIsExpanded(true);
  };

  const handleContainerLeave = () => {
    collapseTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 500);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { name: name || "Achiever" }
      }
    });

    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created! You're now logged in." });
    }
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: error.message, variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-background overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Grid Background */}
      <div ref={gridRef} className="absolute inset-0 grid gap-0.5 p-1" style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${window.innerWidth > 768 ? 60 : 45}px, 1fr))`,
      }}>
        {gridItems.map((item) => (
          <div
            key={item.index}
            data-grid-index={item.index}
            className={cn(
              "aspect-square rounded-sm border transition-all duration-300",
              item.isActive
                ? "bg-primary/90 border-primary shadow-lg shadow-primary/50 scale-110"
                : item.isTraced
                  ? "bg-primary/30 border-primary/50 shadow-md shadow-primary/30"
                  : "bg-secondary/30 border-border/20"
            )}
            style={{
              animation: !item.isActive && !item.isTraced ? `breatheWave 4s ease-in-out infinite ${item.animationDelay}` : 'none',
            }}
          />
        ))}
      </div>

      {/* Login Container */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-500 cursor-pointer",
          isExpanded
            ? "w-[400px] max-w-[90vw] p-8 rounded-2xl"
            : "w-[150px] h-[60px] p-4 rounded-xl"
        )}
        style={{
          background: 'rgba(20, 20, 30, 0.95)',
          backdropFilter: 'blur(10px)',
          border: `2px solid ${isExpanded ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--primary) / 0.8)'}`,
          boxShadow: isExpanded
            ? '0 20px 40px rgba(0,0,0,0.5), 0 0 30px hsl(var(--primary) / 0.3)'
            : '0 10px 20px rgba(0,0,0,0.3), 0 0 40px hsl(var(--primary) / 0.5)',
        }}
        onMouseEnter={handleContainerEnter}
        onMouseLeave={handleContainerLeave}
        onClick={handleContainerEnter}
      >
        {/* Collapsed State */}
        <div className={cn(
          "text-center text-primary font-bold text-lg tracking-wider transition-opacity",
          isExpanded ? "opacity-0 pointer-events-none absolute" : "opacity-100"
        )}>
          Log in
        </div>

        {/* Expanded Form */}
        <div className={cn(
          "transition-opacity duration-300",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <h2 className="text-2xl font-bold text-center text-primary mb-6 tracking-wide">
            {isSignUp ? "SIGN UP" : "SIGN IN"}
          </h2>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/30 focus:border-primary"
                  onFocus={handleContainerEnter}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/30 focus:border-primary"
                onFocus={handleContainerEnter}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/30 focus:border-primary"
                onFocus={handleContainerEnter}
              />
            </div>

            <div className="flex justify-between text-sm">
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => toast({ title: "Password reset coming soon" })}
              >
                Forgot Password
              </button>
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/80 font-bold tracking-wide uppercase"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : (isSignUp ? "Create Account" : "Login")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes breatheWave {
          0%, 100% {
            box-shadow: 0 0 1px hsl(var(--primary) / 0.03);
            border-color: hsl(var(--primary) / 0.06);
          }
          50% {
            box-shadow: 0 0 4px hsl(var(--primary) / 0.15);
            border-color: hsl(var(--primary) / 0.21);
          }
        }
      `}</style>
    </div>
  );
};

export default Auth;
