import { ChevronDown, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type CompleteRoute } from "@/services/routeService";

interface RouteSelectorProps {
  routes: CompleteRoute[];
  currentRoute: CompleteRoute | null;
  onRouteChange: (route: CompleteRoute) => void;
  isLoading?: boolean;
}

export const RouteSelector = ({ 
  routes, 
  currentRoute, 
  onRouteChange, 
  isLoading = false 
}: RouteSelectorProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
        <div className="h-4 bg-white/20 rounded animate-pulse w-48"></div>
      </div>
    );
  }

  if (!currentRoute) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Bus className="h-4 w-4 text-white" />
        </div>
        <span className="text-white">No hay rutas disponibles</span>
      </div>
    );
  }

  const getBadgeText = (routeName: string) => {
    if (routeName.includes('M1')) return 'M1';
    if (routeName.includes('Centro')) return 'CP';
    if (routeName.includes('Azul')) return 'LA';
    if (routeName.includes('Universidad')) return 'RU';
    if (routeName.includes('Roja')) return 'LR';
    return 'R';
  };

  return (
    <div className="flex items-center space-x-3">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: currentRoute.color }}
      >
        <span className="text-white">{getBadgeText(currentRoute.name)}</span>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 justify-start p-0 h-auto font-semibold text-base"
          >
            <span className="truncate max-w-[200px] sm:max-w-[300px]">
              {currentRoute.name}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="start" 
          className="w-80 max-h-80 overflow-y-auto bg-white border border-gray-200 shadow-lg"
        >
          {routes.map((route) => (
            <DropdownMenuItem
              key={route.id}
              onClick={() => onRouteChange(route)}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: route.color }}
              >
                <span className="text-white">{getBadgeText(route.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {route.name}
                </div>
                {route.description && (
                  <div className="text-sm text-gray-500 truncate">
                    {route.description}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {route.stops.length} paradas • {route.points.length} puntos
                </div>
              </div>
              {currentRoute.id === route.id && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};