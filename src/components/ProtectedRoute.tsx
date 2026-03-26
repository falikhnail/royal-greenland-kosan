import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { KeepAliveProvider } from "@/hooks/useKeepAlive";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return <KeepAliveProvider>{children}</KeepAliveProvider>;
};

export default ProtectedRoute;
