import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Clock, BookOpen, BarChart3, Play, CheckCircle2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { courses, getLessonsByCourse } from '@/mocks/courses';
import { useProgress } from '@/contexts/ProgressContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function CourseDetailScreen() {
    const { courseId } = useLocalSearchParams<{ courseId: string }>();
    const router = useRouter();
    const { getCourseProgress, isLessonCompleted } = useProgress();
    const { t } = useLanguage();
    const { colors } = useTheme();

    const styles = makeStyles(colors);

    const course = courses.find(c => c.id === courseId);
    const lessons = getLessonsByCourse(courseId || '');
    const progress = getCourseProgress(courseId || '');

    if (!course) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{t('courseNotFound')}</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerTitle: t(course.title as any), headerBackTitle: t('back') }} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Image source={{ uri: course.thumbnailUrl }} style={styles.heroImage} />

                <View style={styles.content}>
                    <View style={styles.badges}>
                        <View style={[styles.categoryBadge, { backgroundColor: Colors.categories[course.category] }]}>
                            <Text style={styles.badgeText}>{t(course.category as 'mathematics' | 'physics' | 'languages')}</Text>
                        </View>
                        <View style={[styles.levelBadge, { backgroundColor: Colors.levels[course.level] }]}>
                            <Text style={styles.badgeText}>{t(course.level as 'beginner' | 'intermediate' | 'advanced')}</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{t(course.title as any)}</Text>
                    <Text style={styles.description}>{t(course.description as any)}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <BookOpen color={colors.textSecondary} size={18} />
                            <Text style={styles.metaText}>{course.lessonsCount} {t('lessons')}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Clock color={colors.textSecondary} size={18} />
                            <Text style={styles.metaText}>{course.duration}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <BarChart3 color={colors.textSecondary} size={18} />
                            <Text style={styles.metaText}>{progress}% {t('done')}</Text>
                        </View>
                    </View>

                    {progress > 0 && (
                        <View style={styles.progressSection}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                            </View>
                        </View>
                    )}

                    <View style={styles.lessonsSection}>
                        <Text style={styles.sectionTitle}>{t('courseContent')}</Text>

                        {lessons.map((lesson, index) => {
                            const completed = isLessonCompleted(courseId || '', lesson.id);

                            return (
                                <TouchableOpacity
                                    key={lesson.id}
                                    style={[styles.lessonItem, completed && styles.lessonCompleted]}
                                    onPress={() => router.push(`/lesson/${lesson.id}`)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.lessonLeft}>
                                        <View style={[styles.lessonNumber, completed && styles.lessonNumberCompleted]}>
                                            {completed ? (
                                                <CheckCircle2 color="#FFF" size={18} />
                                            ) : (
                                                <Text style={styles.lessonNumberText}>{index + 1}</Text>
                                            )}
                                        </View>
                                        <View style={styles.lessonInfo}>
                                            <Text style={[styles.lessonTitle, completed && styles.lessonTitleCompleted]}>
                                                {t(lesson.title as any)}
                                            </Text>
                                            <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.playButton, completed && styles.playButtonCompleted]}>
                                        <Play color={completed ? colors.success : colors.tint} size={16} fill={completed ? colors.success : colors.tint} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    errorText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    heroImage: {
        width: '100%',
        height: 200,
        backgroundColor: colors.border,
    },
    content: {
        padding: 20,
    },
    badges: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    levelBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFF',
        textTransform: 'capitalize',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    progressSection: {
        marginTop: 16,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.tint,
        borderRadius: 4,
    },
    lessonsSection: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 16,
    },
    lessonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    lessonCompleted: {
        backgroundColor: colors.theme === 'dark' ? '#064E3B' : '#F0FDF4',
        borderWidth: 1,
        borderColor: colors.theme === 'dark' ? '#059669' : '#BBF7D0',
    },
    lessonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    lessonNumber: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.theme === 'dark' ? '#1E3A8A' : '#E0F2FE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    lessonNumberCompleted: {
        backgroundColor: colors.success,
    },
    lessonNumberText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.tint,
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    lessonTitleCompleted: {
        color: colors.success,
    },
    lessonDuration: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    playButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.theme === 'dark' ? '#1E3A8A' : '#E0F2FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButtonCompleted: {
        backgroundColor: colors.theme === 'dark' ? '#064E3B' : '#D1FAE5',
    },
    bottomPadding: {
        height: 30,
    },
});
