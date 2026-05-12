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
  const [faviconVersion, setFaviconVersion] = useState<number>(Date.now());

  const resolveFaviconUrl = (rawFavicon: string) => {
    const fallback = '/favicon.svg';
    const value = String(rawFavicon || '').trim();
    if (!value) return fallback;

    if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;

    try {
      const apiOrigin = new URL(import.meta.env.VITE_API_URL).origin;
      if (value.startsWith('/')) return `${apiOrigin}${value}`;
      return `${apiOrigin}/${value}`;
    } catch {
      if (value.startsWith('/')) return value;
      return `/${value}`;
    }
  };

  const applyFavicon = (favicon: string) => {
    const hrefBase = resolveFaviconUrl(favicon);
    const href = `${hrefBase}${hrefBase.includes('?') ? '&' : '?'}v=${faviconVersion}`;

    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'icon');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  };

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
      setFaviconVersion(Date.now());
    } catch (err) {
      console.error('Failed to load site settings', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    applyFavicon(settings.favicon);
    document.title = settings.siteName || defaultSettings.siteName;
  }, [settings.favicon, settings.siteName, faviconVersion]);

  return (
    <SiteSettingsContext.Provider value={{ settings, refreshSettings: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
