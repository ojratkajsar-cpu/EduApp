import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Play, CheckCircle, ArrowRight, BookOpen, Home } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { lessons, courses, getQuizByLesson } from '@/mocks/courses';
import { useProgress } from '@/contexts/ProgressContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function LessonScreen() {
    const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
    const router = useRouter();
    const { isLessonCompleted } = useProgress();
    const { t } = useLanguage();
    const { colors, theme } = useTheme();
    const [videoWatched, setVideoWatched] = useState(false);

    const styles = makeStyles(colors);

    const lesson = lessons.find(l => l.id === lessonId);
    const course = lesson ? courses.find(c => c.id === lesson.courseId) : null;
    const quiz = lesson ? getQuizByLesson(lesson.id) : null;
    const completed = lesson && course ? isLessonCompleted(course.id, lesson.id) : false;

    if (!lesson || !course) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{t('lessonNotFound')}</Text>
            </View>
        );
    }

    const currentLessonIndex = lessons.filter(l => l.courseId === course.id).findIndex(l => l.id === lessonId);
    const nextLesson = lessons.filter(l => l.courseId === course.id)[currentLessonIndex + 1];

    const youtubeUrl = `https://www.youtube.com/embed/${lesson.videoId}?rel=0&modestbranding=1&playsinline=1`;

    const handleTakeQuiz = () => {
        router.push(`/quiz/${lesson.id}`);
    };

    const handleNextLesson = () => {
        if (nextLesson) {
            router.replace(`/lesson/${nextLesson.id}`);
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerTitle: t(lesson.title as any), headerBackTitle: t('back') }} />
            <View style={styles.container}>
                <View style={styles.videoContainer}>
                    {Platform.OS === 'web' ? (
                        // @ts-ignore
                        <iframe
                            width="100%"
                            height="100%"
                            src={youtubeUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    ) : (
                        <WebView
                            source={{ uri: youtubeUrl }}
                            style={styles.webview}
                            allowsFullscreenVideo
                            javaScriptEnabled
                            onLoadEnd={() => {
                                setTimeout(() => setVideoWatched(true), 5000);
                            }}
                        />
                    )}
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.lessonHeader}>
                        <View style={[styles.categoryBadge, { backgroundColor: Colors.categories[course.category] }]}>
                            <Text style={styles.categoryText}>{t(course.category as any)}</Text>
                        </View>
                        {completed && (
                            <View style={styles.completedBadge}>
                                <CheckCircle color={colors.success} size={16} />
                                <Text style={styles.completedText}>{t('completed')}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.title}>{t(lesson.title as any)}</Text>
                    <Text style={styles.courseName}>{t(course.title as any)}</Text>

                    <View style={styles.durationRow}>
                        <Play color={colors.textSecondary} size={16} />
                        <Text style={styles.duration}>{lesson.duration}</Text>
                    </View>

                    <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>{t('aboutThisLesson')}</Text>
                        <Text style={styles.description}>{t(lesson.description as any)}</Text>
                    </View>

                    <View style={styles.actionsSection}>
                        {!completed && quiz && (
                            <TouchableOpacity
                                style={styles.quizButton}
                                onPress={handleTakeQuiz}
                                activeOpacity={0.8}
                            >
                                <BookOpen color="#FFF" size={20} />
                                <Text style={styles.quizButtonText}>{t('takeQuizToComplete')}</Text>
                            </TouchableOpacity>
                        )}

                        {completed && nextLesson && (
                            <TouchableOpacity
                                style={styles.nextButton}
                                onPress={handleNextLesson}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.nextButtonText}>{t('nextLesson')}</Text>
                                <ArrowRight color="#FFF" size={20} />
                            </TouchableOpacity>
                        )}

                        {completed && !nextLesson && (
                            <View style={styles.completionCard}>
                                <CheckCircle color={colors.success} size={32} />
                                <Text style={styles.completionTitle}>{t('courseCompleted')}</Text>
                                <Text style={styles.completionText}>
                                    {t('finishedAllLessons')}
                                </Text>
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={() => router.push(`/course/${course.id}`)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.backButtonText}>{t('backToCourse')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.homeButton}
                        onPress={() => router.push('/(tabs)')}
                        activeOpacity={0.8}
                    >
                        <Home color={colors.tint} size={18} />
                        <Text style={styles.homeButtonText}>{t('backToHome') || 'На главную'}</Text>
                    </TouchableOpacity>

                    <View style={styles.bottomPadding} />
                </ScrollView>
            </View>
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
    videoContainer: {
        width: '100%',
        maxWidth: 860,
        alignSelf: 'center',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    webview: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    lessonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFF',
        textTransform: 'capitalize',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.theme === 'dark' ? '#064E3B' : '#D1FAE5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    completedText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.success,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    courseName: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    duration: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    descriptionSection: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    actionsSection: {
        marginTop: 8,
    },
    quizButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: colors.tint,
        paddingVertical: 16,
        borderRadius: 14,
        shadowColor: colors.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    quizButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: colors.success,
        paddingVertical: 16,
        borderRadius: 14,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    completionCard: {
        backgroundColor: colors.theme === 'dark' ? '#064E3B' : '#F0FDF4',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.theme === 'dark' ? '#059669' : '#BBF7D0',
    },
    completionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.success,
        marginTop: 12,
    },
    completionText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    backButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: colors.success,
        borderRadius: 10,
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    bottomPadding: {
        height: 30,
    },
    homeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: colors.tint,
        backgroundColor: 'transparent',
    },
    homeButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.tint,
    },
});
