

## Plan: Actualizar IMEI de la unidad R22-218

**Situación actual:**
- R22-218 (TrackSolid) tiene IMEI `359857085116036` (activa)
- El nuevo IMEI proporcionado es `359857081120966`

**Acción:**
1. Desactivar la unidad actual R22-218 con IMEI `359857085116036` (`is_active = false`)
2. Insertar nueva unidad R22-218 con IMEI `359857081120966`, provider `tracksolid`, `is_active = true`

Esto mantiene el historial del IMEI anterior como respaldo.

