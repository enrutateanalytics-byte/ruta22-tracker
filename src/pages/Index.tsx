import { useState } from "react";
import { Link } from "react-router-dom";
import { MapView } from "@/components/transport/MapView";
import { ScheduleView } from "@/components/transport/ScheduleView";
import { InfoView } from "@/components/transport/InfoView";
import { TabBar } from "@/components/transport/TabBar";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'schedule' | 'info'>('map');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'map':
        return <MapView />;
      case 'schedule':
        return <ScheduleView />;
      case 'info':
        return <InfoView />;
      default:
        return <MapView />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-primary text-white px-4 py-3 shadow-transport">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-sm">M1</span>
            </div>
            <h1 className="text-xl font-semibold">M1 R18 - Apoyo Urbi 2 / Barcelona</h1>
          </div>
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderActiveView()}
      </main>

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;