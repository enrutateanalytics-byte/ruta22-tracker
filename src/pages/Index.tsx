import { useState } from "react";
import { Link } from "react-router-dom";
import { MapView } from "@/components/transport/MapView";
import { ScheduleView } from "@/components/transport/ScheduleView";
import { InfoView } from "@/components/transport/InfoView";
import { TabBar } from "@/components/transport/TabBar";
import { RouteSelector } from "@/components/transport/RouteSelector";
import { useRouteData } from "@/hooks/useRouteData";
import { Settings, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { importRealKMLRoute } from "@/utils/importKMLRoute";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'schedule' | 'info'>('map');
  const { routes, currentRoute, setCurrentRoute, isLoadingRoutes } = useRouteData();
  const [isImporting, setIsImporting] = useState(false);

  const handleImportKML = async () => {
    setIsImporting(true);
    try {
      toast.info("Importando ruta desde KML...");
      await importRealKMLRoute();
      toast.success("Ruta importada exitosamente!");
    } catch (error) {
      console.error("Error importing KML:", error);
      toast.error("Error al importar la ruta KML");
    } finally {
      setIsImporting(false);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'map':
        return <MapView currentRoute={currentRoute} />;
      case 'schedule':
        return <ScheduleView currentRoute={currentRoute} />;
      case 'info':
        return <InfoView currentRoute={currentRoute} />;
      default:
        return <MapView currentRoute={currentRoute} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-primary text-white px-4 py-3 shadow-transport">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <RouteSelector
              routes={routes}
              currentRoute={currentRoute}
              onRouteChange={setCurrentRoute}
              isLoading={isLoadingRoutes}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20"
              onClick={handleImportKML}
              disabled={isImporting}
            >
              <Download className="h-4 w-4 mr-1" />
              {isImporting ? "Importando..." : "Importar KML"}
            </Button>
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
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