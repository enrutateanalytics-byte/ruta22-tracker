import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapView } from "@/components/transport/MapView";
import { ScheduleView } from "@/components/transport/ScheduleView";
import { InfoView } from "@/components/transport/InfoView";
import { TabBar } from "@/components/transport/TabBar";
import { RouteSelector } from "@/components/transport/RouteSelector";
import { useRouteData } from "@/hooks/useRouteData";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, LogIn, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";


const Index = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'schedule' | 'info'>('map');
  const [refreshKey, setRefreshKey] = useState(0);
  const { routes, currentRoute, setCurrentRoute, isLoadingRoutes } = useRouteData();
  const { user, isAdmin, signOut } = useAuth();

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
          <div className="flex items-center gap-1">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" title="Panel admin">
                  <Shield className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={signOut}
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" title="Iniciar sesión">
                  <LogIn className="h-4 w-4" />
                </Button>
              </Link>
            )}
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