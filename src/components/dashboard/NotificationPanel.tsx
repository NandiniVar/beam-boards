import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";

interface Activity {
  id: string;
  action: string;
  created_at: string;
  user_id: string;
  ticket_id: string;
}

interface TicketInfo {
  title: string;
}

const NotificationPanel = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, any>>(new Map());
  const [ticketInfo, setTicketInfo] = useState<Map<string, TicketInfo>>(new Map());

  useEffect(() => {
    fetchActivities();

    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities'
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;
      
      if (activitiesData && activitiesData.length > 0) {
        setActivities(activitiesData);

        // Fetch user profiles
        const userIds = [...new Set(activitiesData.map(a => a.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        if (profiles) {
          const profileMap = new Map(profiles.map(p => [p.id, p]));
          setUserProfiles(profileMap);
        }

        // Fetch ticket info
        const ticketIds = [...new Set(activitiesData.map(a => a.ticket_id))];
        const { data: tickets } = await supabase
          .from("tickets")
          .select("id, title")
          .in("id", ticketIds);

        if (tickets) {
          const ticketMap = new Map(tickets.map(t => [t.id, { title: t.title }]));
          setTicketInfo(ticketMap);
        }
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 w-80 z-50">
      <Card className="shadow-lg">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <h3 className="font-semibold">Recent Activity</h3>
        </div>
        <ScrollArea className="h-96">
          <div className="p-4 space-y-4">
            {activities.map((activity) => {
              const profile = userProfiles.get(activity.user_id);
              const ticket = ticketInfo.get(activity.ticket_id);
              
              return (
                <div key={activity.id} className="text-sm">
                  <p className="font-medium text-foreground">
                    {profile?.full_name || profile?.email || 'Unknown User'}
                  </p>
                  <p className="text-muted-foreground">
                    {activity.action} - {ticket?.title || 'Unknown Ticket'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default NotificationPanel;