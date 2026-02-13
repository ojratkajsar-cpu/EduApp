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
import Colors from '@/constants/colors';
import { courses, getCoursesByCategory } from '@/mocks/courses';
import { useProgress } from '@/contexts/ProgressContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Category, Course } from '@/types';

export default function HomeScreen() {
    const router = useRouter();
    const { getOverallProgress, getCompletedCoursesCount, getCompletedLessonsCount, getCourseProgress } = useProgress();
    const { t } = useLanguage();
    const { colors, theme } = useTheme();

    const styles = makeStyles(colors);

    const categories: { id: Category | 'all'; labelKey: 'mathematics' | 'physics' | 'languages'; color: string }[] = [
        { id: 'mathematics', labelKey: 'mathematics', color: Colors.categories.mathematics },
        { id: 'physics', labelKey: 'physics', color: Colors.categories.physics },
        { id: 'languages', labelKey: 'languages', color: Colors.categories.languages },
    ];

    const renderCourseCard = (course: Course) => {
        const progress = getCourseProgress(course.id);
        return (
            <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => router.push(`/course/${course.id}`)}
                activeOpacity={0.7}
            >
                <Image source={{ uri: course.thumbnailUrl }} style={styles.courseImage} />
                <View style={styles.courseInfo}>
                    <View style={[styles.categoryBadge, { backgroundColor: Colors.categories[course.category] }]}>
                        <Text style={styles.categoryBadgeText}>{t(course.category as any)}</Text>
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
                    <Text style={styles.greeting}>{t('welcomeBack')}</Text>
                    <Text style={styles.title}>{t('continueLearning')}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: theme === 'dark' ? '#1E3A8A' : '#E0F2FE' }]}>
                            <TrendingUp color={colors.tint} size={20} />
                        </View>
                        <Text style={styles.statValue}>{getOverallProgress()}%</Text>
                        <Text style={styles.statLabel}>{t('progress')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: theme === 'dark' ? '#78350F' : '#FEF3C7' }]}>
                            <BookOpen color={colors.accent} size={20} />
                        </View>
                        <Text style={styles.statValue}>{getCompletedLessonsCount()}</Text>
                        <Text style={styles.statLabel}>{t('lessons')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: theme === 'dark' ? '#064E3B' : '#D1FAE5' }]}>
                            <Award color={colors.success} size={20} />
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
                        <Text style={styles.sectionTitle}>{t('featuredCourses')}</Text>
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
                        <Text style={styles.sectionTitle}>{t('continueWhereYouLeft')}</Text>
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
                                    <Text style={styles.emptyText}>{t('startCourseToTrack')}</Text>
                                </View>
                            )}
                    </ScrollView>
                </View>
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
    greeting: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
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
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
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
        borderRadius: 12,
        padding: 16,
        paddingRight: 40,
        borderLeftWidth: 4,
        minWidth: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
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
        right: 12,
        top: '50%',
    },
    coursesContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    courseCard: {
        width: 220,
        backgroundColor: colors.card,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    courseImage: {
        width: '100%',
        height: 120,
        backgroundColor: colors.border,
    },
    courseInfo: {
        padding: 14,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFF',
        textTransform: 'capitalize',
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
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        marginTop: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.tint,
        borderRadius: 2,
    },
    emptyState: {
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
});
