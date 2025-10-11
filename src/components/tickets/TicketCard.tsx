import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  created_by: string;
  updated_by: string | null;
}

interface TicketCardProps {
  ticket: Ticket;
  userProfiles: Map<string, any>;
  onStatusChange: (ticketId: string, newStatus: 'todo' | 'in_progress' | 'done') => void;
  showSuperUser: boolean;
}

const TicketCard = ({ ticket, userProfiles, onStatusChange, showSuperUser }: TicketCardProps) => {
  const canMoveLeft = ticket.status !== 'todo';
  const canMoveRight = ticket.status !== 'done';

  const handleMoveLeft = () => {
    const newStatus = ticket.status === 'done' ? 'in_progress' : 'todo';
    onStatusChange(ticket.id, newStatus);
  };

  const handleMoveRight = () => {
    const newStatus = ticket.status === 'todo' ? 'in_progress' : 'done';
    onStatusChange(ticket.id, newStatus);
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{ticket.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ticket.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {ticket.description}
          </p>
        )}

        {showSuperUser && (() => {
          const creator = userProfiles.get(ticket.created_by);
          const updater = ticket.updated_by ? userProfiles.get(ticket.updated_by) : null;
          
          return (
            <div className="space-y-1 text-xs text-muted-foreground">
              {creator && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Created by {creator.full_name || creator.email}</span>
                </div>
              )}
              {updater && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Updated by {updater.full_name || updater.email}</span>
                </div>
              )}
            </div>
          );
        })()}

        <div className="flex gap-2 pt-2">
          {canMoveLeft && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMoveLeft}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          {canMoveRight && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMoveRight}
              className="flex-1"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketCard;