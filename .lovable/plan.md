

## Plan: Ocultar unidades en tiempo real temporalmente

Cambio simple: comentar el polling de GPS y los marcadores de autobús para que no aparezcan unidades en el mapa hasta que se reactive manualmente.

### Cambios

1. **`src/hooks/useRouteData.ts`** — Comentar el `useEffect` que hace polling a los proveedores GPS. Inicializar `busUnits` como array vacío y `isApiConnected` como `false`.

2. **`src/components/transport/MapView.tsx`** — Comentar el bloque que renderiza los `GoogleBusMarker` para que no se muestren marcadores de autobús.

Esto es reversible: cuando quieras reactivar, solo se descomenta el código.

