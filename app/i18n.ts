import { I18n } from 'i18n-js';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import { getLocales } from 'expo-localization';

const i18n = new I18n();

i18n.translations = {
  en,
  fr,
};
const locale = getLocales()[0].languageCode;
i18n.locale = locale?.startsWith('fr') ? 'fr' : 'en';

i18n.enableFallback = true;

export default i18n;
