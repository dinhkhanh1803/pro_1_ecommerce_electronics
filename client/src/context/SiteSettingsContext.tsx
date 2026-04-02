import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteSettings {
  siteName: string;
  supportEmail: string;
  siteDescription: string;
  primaryLogo: string;
  favicon: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  refreshSettings: () => void;
}

const defaultSettings: SiteSettings = {
  siteName: 'ShopHub',
  supportEmail: 'support@shophub.com',
  siteDescription: 'Your trusted marketplace for quality products from verified sellers worldwide.',
  primaryLogo: '',
  favicon: '',
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  refreshSettings: () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cms/settings`);
      const data = await res.json();
      setSettings({
        siteName: data.siteName || defaultSettings.siteName,
        supportEmail: data.supportEmail || defaultSettings.supportEmail,
        siteDescription: data.siteDescription || defaultSettings.siteDescription,
        primaryLogo: data.primaryLogo || '',
        favicon: data.favicon || '',
      });
    } catch (err) {
      console.error('Failed to load site settings', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, refreshSettings: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
