import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProjectList from "@/components/dashboard/ProjectList";
import CreateProjectDialog from "@/components/dashboard/CreateProjectDialog";
import SuperUserToggle from "@/components/dashboard/SuperUserToggle";
import NotificationPanel from "@/components/dashboard/NotificationPanel";

const Dashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuperUser, setShowSuperUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <DashboardHeader 
        session={session}
        showSuperUser={showSuperUser}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage your projects and tickets</p>
          </div>
          <div className="flex gap-4">
            <SuperUserToggle 
              showSuperUser={showSuperUser}
              onToggle={setShowSuperUser}
            />
            <CreateProjectDialog />
          </div>
        </div>

        <ProjectList showSuperUser={showSuperUser} />
      </main>

      <NotificationPanel />
    </div>
  );
};

export default Dashboard;