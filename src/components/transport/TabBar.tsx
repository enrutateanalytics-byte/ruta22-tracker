import { Map, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabBarProps {
  activeTab: 'map' | 'schedule' | 'info';
  onTabChange: (tab: 'map' | 'schedule' | 'info') => void;
}

export const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
  const tabs = [
    { id: 'map' as const, icon: Map, label: 'Mapa' },
    { id: 'schedule' as const, icon: Clock, label: 'Horarios' },
    { id: 'info' as const, icon: Info, label: 'Info' },
  ];

  return (
    <nav className="bg-white border-t border-border shadow-tab">
      <div className="flex">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex-1 flex flex-col items-center py-3 px-2 transition-colors duration-200",
              activeTab === id
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Icon size={20} className="mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};