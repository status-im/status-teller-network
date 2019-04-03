import i18n from "i18next";
import { reactI18nextModule } from "react-i18next";
import LngDetector from "i18next-browser-languagedetector";

import translationEn from './locales/en.json';

i18n
  .use(reactI18nextModule)
  .use(LngDetector)
  .init({
    resources: {
      en: {
        translation: translationEn
      }
    },
    debug: true,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
