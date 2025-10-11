import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TicketCard from "./TicketCard";

interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  created_by: string;
  updated_by: string | null;
}

interface TicketColumnProps {
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  tickets: Ticket[];
  userProfiles: Map<string, any>;
  onStatusChange: (ticketId: string, newStatus: 'todo' | 'in_progress' | 'done') => void;
  showSuperUser: boolean;
}

const TicketColumn = ({ title, status, tickets, userProfiles, onStatusChange, showSuperUser }: TicketColumnProps) => {
  const getColumnColor = () => {
    switch (status) {
      case 'todo':
        return 'border-l-4 border-l-blue-500';
      case 'in_progress':
        return 'border-l-4 border-l-amber-500';
      case 'done':
        return 'border-l-4 border-l-green-500';
    }
  };

  return (
    <Card className={`${getColumnColor()}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {tickets.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tickets.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No tickets
          </p>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              userProfiles={userProfiles}
              onStatusChange={onStatusChange}
              showSuperUser={showSuperUser}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TicketColumn;