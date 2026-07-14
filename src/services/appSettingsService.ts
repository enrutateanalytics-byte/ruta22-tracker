import { supabase } from "@/integrations/supabase/client";

export interface AppSetting {
  id: string;
  key: string;
  value: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const appSettingsService = {
  /**
   * Get a single app setting by key
   */
  async getSetting(key: string): Promise<AppSetting | null> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      console.error(`[App Settings] Error fetching setting ${key}:`, error);
      return null;
    }

    return data as AppSetting | null;
  },

  /**
   * Check if GPS units should be shown on the map
   * Defaults to true if setting is missing or can't be read
   */
  async isGpsEnabled(): Promise<boolean> {
    try {
      const setting = await this.getSetting('gps_enabled');
      if (!setting) return true;
      return setting.value;
    } catch (error) {
      console.error('[App Settings] Error reading gps_enabled:', error);
      // Default to enabled to avoid breaking the app
      return true;
    }
  },

  /**
   * Update a boolean setting value (admin only)
   */
  async updateSetting(key: string, value: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('app_settings')
      .update({ value })
      .eq('key', key);

    if (error) {
      console.error(`[App Settings] Error updating setting ${key}:`, error);
      return false;
    }

    return true;
  }
};
