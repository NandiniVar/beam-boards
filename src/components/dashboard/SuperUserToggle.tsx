import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SuperUserToggleProps {
  showSuperUser: boolean;
  onToggle: (value: boolean) => void;
}

const SuperUserToggle = ({ showSuperUser, onToggle }: SuperUserToggleProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleToggle = () => {
    if (showSuperUser) {
      onToggle(false);
      toast({
        title: "Super User Mode Disabled",
        description: "User information is now hidden",
      });
    } else {
      setDialogOpen(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demo purposes, accept 'admin123' as password
    if (password === "admin123") {
      onToggle(true);
      setDialogOpen(false);
      setPassword("");
      toast({
        title: "Super User Mode Enabled",
        description: "User information is now visible",
      });
    } else {
      toast({
        title: "Invalid Password",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        variant={showSuperUser ? "default" : "outline"}
        onClick={handleToggle}
        className="gap-2"
      >
        {showSuperUser ? (
          <>
            <Eye className="w-4 h-4" />
            Super User: ON
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4" />
            Super User: OFF
          </>
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Super User Mode</DialogTitle>
            <DialogDescription>
              Enter the super user password to view creator information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter super user password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Default password: admin123
              </p>
            </div>
            <Button type="submit" className="w-full">
              Enable Super User Mode
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuperUserToggle;