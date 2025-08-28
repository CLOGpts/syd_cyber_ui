
import { useAppStore } from '../store/useStore';
import { translations } from '../i18n/translations';

export const useTranslations = () => {
  const language = useAppStore((state) => state.language);
  return translations[language];
};
