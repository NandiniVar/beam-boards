import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import TicketColumn from "./TicketColumn";
import CreateTicketDialog from "./CreateTicketDialog";
import { Loader2 } from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  position: number;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface TicketBoardProps {
  projectId: string;
  showSuperUser: boolean;
}

const TicketBoard = ({ projectId, showSuperUser }: TicketBoardProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchTickets = async () => {
    try {
      const { data: ticketsData, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("project_id", projectId)
        .order("position", { ascending: true });

      if (error) throw error;
      
      if (ticketsData && ticketsData.length > 0) {
        setTickets(ticketsData);

        // Fetch user profiles
        const userIds = [
          ...new Set([
            ...ticketsData.map(t => t.created_by),
            ...ticketsData.map(t => t.updated_by).filter(id => id !== null)
          ])
        ];
        
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
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("tickets")
        .update({ 
          status: newStatus,
          updated_by: user.id
        })
        .eq("id", ticketId);

      if (error) throw error;

      // Log activity
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        await supabase
          .from("activities")
          .insert({
            ticket_id: ticketId,
            user_id: user.id,
            action: `moved ticket to ${newStatus.replace('_', ' ')}`,
          });
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const todoTickets = tickets.filter(t => t.status === 'todo');
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
  const doneTickets = tickets.filter(t => t.status === 'done');

  return (
    <div className="space-y-6">
      <CreateTicketDialog projectId={projectId} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TicketColumn
          title="To Do"
          status="todo"
          tickets={todoTickets}
          userProfiles={userProfiles}
          onStatusChange={handleStatusChange}
          showSuperUser={showSuperUser}
        />
        <TicketColumn
          title="In Progress"
          status="in_progress"
          tickets={inProgressTickets}
          userProfiles={userProfiles}
          onStatusChange={handleStatusChange}
          showSuperUser={showSuperUser}
        />
        <TicketColumn
          title="Done"
          status="done"
          tickets={doneTickets}
          userProfiles={userProfiles}
          onStatusChange={handleStatusChange}
          showSuperUser={showSuperUser}
        />
      </div>
    </div>
  );
};

export default TicketBoard;