import i18next from "i18next";
import storage from "../controllers/storage";

// language files
import en from "./en.json";
import ru from "./ru.json";
import uk from "./uk.json";

// available localization
const translations = { en, ru, uk };

// Takes system language default en
const { languageTag } = RNLocalize.findBestAvailableLanguage(
  Object.keys(translations)
) || { languageTag: "en" };

storage
  .setValue("languageTag", languageTag)
  .then(() => {})
  .catch((e) => {
    console.error(e);
  });

// creates needed
i18next.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: languageTag,
  resources: {
    en: en,
    ru: ru,
    uk: uk,
  },
  react: {
    useSuspense: false,
  },
});

export default i18next;
