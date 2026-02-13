import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { Language, translations, TranslationKey } from '@/constants/translations';

const LANGUAGE_STORAGE_KEY = 'app_language';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
    const queryClient = useQueryClient();

    const languageQuery = useQuery({
        queryKey: ['language'],
        queryFn: async (): Promise<Language> => {
            try {
                const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
                return (stored as Language) || 'ru';
            } catch (error) {
                console.log('Error loading language:', error);
                return 'ru';
            }
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (language: Language) => {
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
            return language;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['language'], data);
        },
    });

    const language = languageQuery.data ?? 'ru';

    const setLanguage = useCallback((lang: Language) => {
        saveMutation.mutate(lang);
    }, [saveMutation]);

    const t = useCallback((key: TranslationKey): string => {
        return translations[language][key] || translations.ru[key] || key;
    }, [language]);

    return {
        language,
        setLanguage,
        t,
        isLoading: languageQuery.isLoading,
    };
});

export function useTranslation() {
    const { t, language } = useLanguage();
    return { t, language };
}
