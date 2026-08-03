import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/i18n/translations";

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: keyof typeof translations.ru): string => {
    return translations[language]?.[key as keyof typeof translations[typeof language]] || key;
  };

  return { t, language };
}
