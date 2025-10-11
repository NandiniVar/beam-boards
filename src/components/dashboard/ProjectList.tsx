import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FolderOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
}

interface ProjectListProps {
  showSuperUser: boolean;
}

const ProjectList = ({ showSuperUser }: ProjectListProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (projectsData && projectsData.length > 0) {
        setProjects(projectsData);

        // Fetch user profiles
        const userIds = [...new Set(projectsData.map(p => p.created_by))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        if (profiles) {
          const profileMap = new Map(profiles.map(p => [p.id, p]));
          setUserProfiles(profileMap);
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent className="pt-6">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card 
          key={project.id}
          className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
          onClick={() => navigate(`/project/${project.id}`)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
            </div>
            <CardTitle className="mt-4">{project.name}</CardTitle>
            {project.description && (
              <CardDescription>{project.description}</CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            {showSuperUser && (() => {
              const profile = userProfiles.get(project.created_by);
              return profile ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Created by {profile.full_name || profile.email}</span>
                </div>
              ) : null;
            })()}
            
            <Button
              className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/project/${project.id}`);
              }}
            >
              View Project
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProjectList;