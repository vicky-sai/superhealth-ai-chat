import { Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onSettingsClick?: () => void;
}

export const ChatHeader = ({ onSettingsClick }: ChatHeaderProps) => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Superhealth</h1>
            <p className="text-sm text-muted-foreground">Your AI Healthcare Assistant</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onSettingsClick}
          className="rounded-full"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};