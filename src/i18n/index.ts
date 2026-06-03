import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptCommon from './locales/pt-BR/common.json';
import ptLanding from './locales/pt-BR/landing.json';
import ptAuth from './locales/pt-BR/auth.json';
import ptDashboard from './locales/pt-BR/dashboard.json';
import ptClients from './locales/pt-BR/clients.json';
import ptProposals from './locales/pt-BR/proposals.json';
import ptPublic from './locales/pt-BR/public.json';
import ptSettings from './locales/pt-BR/settings.json';
import ptAdmin from './locales/pt-BR/admin.json';
import ptPricing from './locales/pt-BR/pricing.json';
import ptOnboarding from './locales/pt-BR/onboarding.json';
import ptIntegrations from './locales/pt-BR/integrations.json';
import ptLegal from './locales/pt-BR/legal.json';

import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enClients from './locales/en/clients.json';
import enProposals from './locales/en/proposals.json';
import enPublic from './locales/en/public.json';
import enSettings from './locales/en/settings.json';
import enAdmin from './locales/en/admin.json';
import enPricing from './locales/en/pricing.json';
import enOnboarding from './locales/en/onboarding.json';
import enIntegrations from './locales/en/integrations.json';
import enLegal from './locales/en/legal.json';

export const defaultNS = 'common';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en'],
    defaultNS,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'closeflow_lang',
    },
    resources: {
      'pt-BR': {
        common: ptCommon,
        landing: ptLanding,
        auth: ptAuth,
        dashboard: ptDashboard,
        clients: ptClients,
        proposals: ptProposals,
        public: ptPublic,
        settings: ptSettings,
        admin: ptAdmin,
        pricing: ptPricing,
        onboarding: ptOnboarding,
        integrations: ptIntegrations,
        legal: ptLegal,
      },
      en: {
        common: enCommon,
        landing: enLanding,
        auth: enAuth,
        dashboard: enDashboard,
        clients: enClients,
        proposals: enProposals,
        public: enPublic,
        settings: enSettings,
        admin: enAdmin,
        pricing: enPricing,
        onboarding: enOnboarding,
        integrations: enIntegrations,
        legal: enLegal,
      },
    },
  });

export default i18n;
