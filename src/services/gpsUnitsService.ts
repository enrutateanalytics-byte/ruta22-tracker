import { supabase } from "@/integrations/supabase/client";

export interface GpsUnitDetails {
  imei: number;
  economic_number: string;
  description?: string;
  is_active: boolean;
}

export const gpsUnitsService = {
  /**
   * Get all GPS units with their economic numbers
   */
  async getAllUnits(): Promise<GpsUnitDetails[]> {
    const { data, error } = await supabase
      .from('gps_units')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('[GPS Units Service] Error fetching units:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a specific unit by IMEI
   */
  async getUnitByImei(imei: number): Promise<GpsUnitDetails | null> {
    const { data, error } = await supabase
      .from('gps_units')
      .select('*')
      .eq('imei', imei)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`[GPS Units Service] Error fetching unit ${imei}:`, error);
      return null;
    }

    return data;
  },

  /**
   * Get a map of IMEI to economic number for quick lookups
   */
  async getImeiToEconomicNumberMap(): Promise<Map<number, string>> {
    const units = await this.getAllUnits();
    const map = new Map<number, string>();
    
    units.forEach(unit => {
      map.set(unit.imei, unit.economic_number);
    });

    return map;
  }
};
