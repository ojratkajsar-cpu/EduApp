import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Filter } from 'lucide-react-native';
import Colors from '@/constants/colors';

const categoryEmoji: Record<string, string> = {
    mathematics: '🔢',
    physics: '⚡',
    languages: '🌍',
};
import { courses } from '@/mocks/courses';
import { useProgress } from '@/contexts/ProgressContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Category, Course } from '@/types';

export default function CoursesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ category?: string }>();
    const { getCourseProgress } = useProgress();
    const { t } = useLanguage();
    const { colors } = useTheme();

    const styles = makeStyles(colors);

    const [selectedFilter, setSelectedFilter] = useState<Category | 'all'>(
        (params.category as Category | 'all') || 'all'
    );
    const [searchQuery, setSearchQuery] = useState('');

    const filters: { id: Category | 'all'; labelKey: 'all' | 'math' | 'physics' | 'languages' }[] = [
        { id: 'all', labelKey: 'all' },
        { id: 'mathematics', labelKey: 'math' },
        { id: 'physics', labelKey: 'physics' },
        { id: 'languages', labelKey: 'languages' },
    ];

    const filteredCourses = useMemo(() => {
        let result = courses;

        if (selectedFilter !== 'all') {
            result = result.filter(course => course.category === selectedFilter);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                course =>
                    t(course.title as any).toLowerCase().includes(query) ||
                    t(course.description as any).toLowerCase().includes(query)
            );
        }

        return result;
    }, [selectedFilter, searchQuery, t]);

    const renderCourseItem = (course: Course) => {
        const progress = getCourseProgress(course.id);

        return (
            <TouchableOpacity
                key={course.id}
                style={styles.courseItem}
                onPress={() => router.push(`/course/${course.id}`)}
                activeOpacity={0.7}
            >
                <Image source={{ uri: course.thumbnailUrl }} style={styles.courseThumbnail} />
                <View style={styles.courseContent}>
                    <View style={styles.courseHeader}>
                        <View style={[styles.levelBadge, { backgroundColor: Colors.levels[course.level] + '20' }]}>
                            <Text style={[styles.levelText, { color: Colors.levels[course.level] }]}>
                                {t(course.level as 'beginner' | 'intermediate' | 'advanced')}
                            </Text>
                        </View>
                        <Text style={styles.categoryEmojiSmall}>{categoryEmoji[course.category] || '📖'}</Text>
                    </View>
                    <Text style={styles.courseTitle} numberOfLines={2}>{t(course.title as any)}</Text>
                    <Text style={styles.courseDescription} numberOfLines={2}>{t(course.description as any)}</Text>
                    <View style={styles.courseMeta}>
                        <Text style={styles.metaText}>{course.lessonsCount} {t('lessonsCount')}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.metaText}>{course.duration}</Text>
                    </View>
                    {progress > 0 && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{progress}%</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>📚 {t('courses')}</Text>
                <Text style={styles.subtitle}>{filteredCourses.length} {t('coursesAvailable')}</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Search color={colors.textSecondary} size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('searchCourses')}
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.filterChip,
                                selectedFilter === filter.id && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedFilter(filter.id)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    selectedFilter === filter.id && styles.filterTextActive,
                                ]}
                            >
                                {t(filter.labelKey)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.coursesList} showsVerticalScrollIndicator={false}>
                {filteredCourses.map(renderCourseItem)}
                {filteredCourses.length === 0 && (
                    <View style={styles.emptyState}>
                        <Filter color={colors.textSecondary} size={48} />
                        <Text style={styles.emptyTitle}>{t('noCoursesFound')}</Text>
                        <Text style={styles.emptyText}>{t('tryAdjusting')}</Text>
                    </View>
                )}
                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
    },
    filtersContainer: {
        paddingVertical: 8,
    },
    filtersList: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterChipActive: {
        backgroundColor: colors.tint,
        borderColor: colors.tint,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    filterTextActive: {
        color: '#FFF',
    },
    coursesList: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    courseItem: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    courseThumbnail: {
        width: 110,
        height: '100%',
        minHeight: 140,
        backgroundColor: colors.border,
    },
    courseContent: {
        flex: 1,
        padding: 14,
    },
    courseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    levelBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    levelText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    categoryEmojiSmall: {
        fontSize: 18,
    },

    courseTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
        lineHeight: 20,
    },
    courseDescription: {
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 16,
        marginBottom: 8,
    },
    courseMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    metaDot: {
        marginHorizontal: 6,
        color: colors.textSecondary,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 8,
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.tint,
        borderRadius: 2,
    },
    progressText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.tint,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    bottomPadding: {
        height: 24,
    },
});
