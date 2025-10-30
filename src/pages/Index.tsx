import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapView } from "@/components/transport/MapView";
import { ScheduleView } from "@/components/transport/ScheduleView";
import { InfoView } from "@/components/transport/InfoView";
import { TabBar } from "@/components/transport/TabBar";
import { RouteSelector } from "@/components/transport/RouteSelector";
import { useRouteData } from "@/hooks/useRouteData";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateRuta22WithKMLData } from "@/utils/updateRuta22";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'schedule' | 'info'>('map');
  const [refreshKey, setRefreshKey] = useState(0);
  const { routes, currentRoute, setCurrentRoute, isLoadingRoutes } = useRouteData();

  // Auto-update Ruta 22 from KML on mount
  useEffect(() => {
    const updateRoute = async () => {
      try {
        console.log('🔄 Auto-updating Ruta 22 from KML...');
        await updateRuta22WithKMLData();
        console.log('✅ Ruta 22 auto-updated successfully');
        // Force refresh by incrementing key
        setRefreshKey(prev => prev + 1);
        // Reload the page to refresh route data
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (error) {
        console.error('❌ Failed to auto-update Ruta 22:', error);
      }
    };
    
    // Only run if not already updated in this session
    const lastUpdate = sessionStorage.getItem('ruta22_last_update');
    const now = Date.now();
    
    // Update if never updated or last update was more than 1 minute ago
    if (!lastUpdate || now - parseInt(lastUpdate) > 60000) {
      updateRoute();
      sessionStorage.setItem('ruta22_last_update', now.toString());
    }
  }, []);

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
          {/* <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Settings className="h-4 w-4" />
            </Button>
          </Link> */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderActiveView()}
      </main>

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Footer */}
      <footer className="bg-muted/30 border-t px-4 py-2 text-center text-xs text-muted-foreground">
        <Link to="/privacy-policy" className="hover:text-foreground hover:underline">
          Política de Privacidad
        </Link>
      </footer>
    </div>
  );
};

export default Index;