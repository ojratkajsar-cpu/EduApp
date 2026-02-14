import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, TrendingUp, Award, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { courses, getCoursesByCategory } from '@/mocks/courses';
import { useProgress } from '@/contexts/ProgressContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Category, Course } from '@/types';

const categoryEmoji: Record<string, string> = {
    mathematics: '🔢',
    physics: '⚡',
    languages: '🌍',
};

export default function HomeScreen() {
    const router = useRouter();
    const { getOverallProgress, getCompletedCoursesCount, getCompletedLessonsCount, getCourseProgress } = useProgress();
    const { t } = useLanguage();
    const { colors, theme } = useTheme();

    const styles = makeStyles(colors, theme);

    const categories: { id: Category | 'all'; labelKey: 'mathematics' | 'physics' | 'languages'; color: string }[] = [
        { id: 'mathematics', labelKey: 'mathematics', color: Colors.categories.mathematics },
        { id: 'physics', labelKey: 'physics', color: Colors.categories.physics },
        { id: 'languages', labelKey: 'languages', color: Colors.categories.languages },
    ];

    const renderCourseCard = (course: Course) => {
        const progress = getCourseProgress(course.id);
        const emoji = categoryEmoji[course.category] || '📖';
        return (
            <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => router.push(`/course/${course.id}`)}
                activeOpacity={0.7}
            >
                <Image source={{ uri: course.thumbnailUrl }} style={styles.courseImage} />
                <View style={styles.courseInfo}>
                    <View style={[styles.categoryBadge, { backgroundColor: Colors.categories[course.category] + '20' }]}>
                        <Text style={[styles.categoryBadgeText, { color: Colors.categories[course.category] }]}>
                            {emoji} {t(course.category as any)}
                        </Text>
                    </View>
                    <Text style={styles.courseTitle} numberOfLines={1}>{t(course.title as any)}</Text>
                    <Text style={styles.courseMeta}>{course.lessonsCount} {t('lessons')} • {course.duration}</Text>
                    {progress > 0 && (
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${progress}%` }]} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>👋 {t('welcomeBack')}</Text>
                    <Text style={styles.title}>{t('continueLearning')}</Text>
                </View>

                {/* Мотивационный баннер */}
                <View style={styles.bannerContainer}>
                    <LinearGradient
                        colors={theme === 'dark' ? ['#1E3A5F', '#2D1B69'] : ['#3B82F6', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.motivationBanner}
                    >
                        <Text style={styles.bannerEmoji}>🌟</Text>
                        <View style={styles.bannerTextContainer}>
                            <Text style={styles.bannerTitle}>{t('keepItUp') || 'Так держать!'}</Text>
                            <Text style={styles.bannerSubtitle}>
                                {t('everyLessonMatters') || 'Каждый урок — шаг к знаниям!'}
                            </Text>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: theme === 'dark' ? '#1E3A8A' : '#DBEAFE' }]}>
                            <Text style={styles.statEmoji}>📈</Text>
                        </View>
                        <Text style={styles.statValue}>{getOverallProgress()}%</Text>
                        <Text style={styles.statLabel}>{t('progress')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: theme === 'dark' ? '#78350F' : '#FEF3C7' }]}>
                            <Text style={styles.statEmoji}>📚</Text>
                        </View>
                        <Text style={styles.statValue}>{getCompletedLessonsCount()}</Text>
                        <Text style={styles.statLabel}>{t('lessons')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: theme === 'dark' ? '#064E3B' : '#DCFCE7' }]}>
                            <Text style={styles.statEmoji}>🏆</Text>
                        </View>
                        <Text style={styles.statValue}>{getCompletedCoursesCount()}</Text>
                        <Text style={styles.statLabel}>{t('completed')}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('categories')}</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[styles.categoryCard, { borderLeftColor: category.color }]}
                                onPress={() => router.push({ pathname: '/courses', params: { category: category.id } })}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.categoryEmoji}>{categoryEmoji[category.id] || '📖'}</Text>
                                <Text style={styles.categoryName}>{t(category.labelKey)}</Text>
                                <Text style={styles.categoryCount}>
                                    {getCoursesByCategory(category.id).length} {t('coursesCount')}
                                </Text>
                                <ChevronRight color={colors.textSecondary} size={18} style={styles.categoryArrow} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>✨ {t('featuredCourses')}</Text>
                        <TouchableOpacity onPress={() => router.push('/courses')}>
                            <Text style={styles.seeAll}>{t('seeAll')}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.coursesContainer}>
                        {courses.slice(0, 4).map(renderCourseCard)}
                    </ScrollView>
                </View>

                <View style={[styles.section, { marginBottom: 24 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>▶️ {t('continueWhereYouLeft')}</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.coursesContainer}>
                        {courses.filter(c => {
                            const p = getCourseProgress(c.id);
                            return p > 0 && p < 100;
                        }).slice(0, 3).map(renderCourseCard)}
                        {courses.filter(c => {
                            const p = getCourseProgress(c.id);
                            return p > 0 && p < 100;
                        }).length === 0 && (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyEmoji}>🚀</Text>
                                    <Text style={styles.emptyText}>{t('startCourseToTrack')}</Text>
                                </View>
                            )}
                    </ScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const makeStyles = (colors: any, theme: string) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    greeting: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
    },
    bannerContainer: {
        paddingHorizontal: 20,
        marginTop: 16,
    },
    motivationBanner: {
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    bannerEmoji: {
        fontSize: 36,
        marginRight: 16,
    },
    bannerTextContainer: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginTop: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statEmoji: {
        fontSize: 20,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    section: {
        marginTop: 28,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    seeAll: {
        fontSize: 14,
        color: colors.tint,
        fontWeight: '500',
    },
    categoriesContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    categoryCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        paddingRight: 44,
        borderLeftWidth: 4,
        minWidth: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    categoryEmoji: {
        fontSize: 24,
        marginBottom: 6,
    },
    categoryName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    categoryCount: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    categoryArrow: {
        position: 'absolute',
        right: 14,
        top: '50%',
    },
    coursesContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    courseCard: {
        width: 240,
        backgroundColor: colors.card,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    courseImage: {
        width: '100%',
        height: 130,
        backgroundColor: colors.border,
    },
    courseInfo: {
        padding: 14,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        marginBottom: 8,
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    courseTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    courseMeta: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        marginTop: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.tint,
        borderRadius: 3,
    },
    emptyState: {
        paddingVertical: 24,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    emptyEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
});
