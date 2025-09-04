import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { GradientCard } from "@/components/ui/gradient-card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center p-4">
      <GradientCard className="p-8 text-center max-w-md">
        <div className="space-y-6">
          <div className="w-16 h-16 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl mb-4">Oops! Page not found</p>
            <p className="text-muted-foreground mb-6">
              The page you're looking for doesn't exist or may have been moved.
            </p>
            <div className="p-3 bg-muted/50 rounded-lg">
              <code className="text-sm break-all">{location.pathname}</code>
            </div>
          </div>
          <Button asChild className="w-full bg-gradient-primary">
            <a href="/">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </a>
          </Button>
        </div>
      </GradientCard>
    </div>
  );
};

export default NotFound;
