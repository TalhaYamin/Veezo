import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import type { SiteSettings } from '../types/admin';

const defaultSettings: Pick<SiteSettings, 'shippingCost' | 'freeShippingThreshold'> = {
  shippingCost: 0,
  freeShippingThreshold: 0,
};

export function useStoreSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<SiteSettings>('/settings')
      .then((data) => {
        setSettings({
          shippingCost: data.shippingCost ?? 0,
          freeShippingThreshold: data.freeShippingThreshold ?? 0,
        });
      })
      .catch(() => setSettings(defaultSettings))
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
