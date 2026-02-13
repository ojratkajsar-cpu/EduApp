import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { courses, getLessonsByCourse } from '@/mocks/courses';
import { BookOpen, CheckCircle, Clock, ChevronLeft } from 'lucide-react-native';

export default function StudentDetailScreen() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const [student, setStudent] = useState<any>(null);
    const [progress, setProgress] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const styles = makeStyles(colors);

    useEffect(() => {
        if (id) {
            loadStudentData();
        }
    }, [id]);

    const loadStudentData = async () => {
        setLoading(true);
        try {
            // Fetch profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            setStudent(profile);

            // Fetch progress
            const { data: progressData } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', id)
                .eq('completed', true);

            setProgress(progressData || []);
        } catch (error) {
            console.error('Error loading student details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCourseProgress = (courseId: string) => {
        const courseLessons = getLessonsByCourse(courseId);
        const completedLessons = progress.filter(
            p => p.course_id === courseId && p.completed
        );

        if (courseLessons.length === 0) return { count: 0, total: 0, percent: 0 };

        return {
            count: completedLessons.length,
            total: courseLessons.length,
            percent: Math.round((completedLessons.length / courseLessons.length) * 100)
        };
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
            </View>
        );
    }

    if (!student) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{t('studentNotFound')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: t('studentDetails'),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
                            <ChevronLeft color={colors.text} size={24} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {student.full_name?.charAt(0).toUpperCase() || '?'}
                        </Text>
                    </View>
                    <Text style={styles.name}>{student.full_name}</Text>
                    <Text style={styles.email}>{student.email}</Text>

                    <View style={styles.summaryCard}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>
                                {progress.length}
                            </Text>
                            <Text style={styles.summaryLabel}>{t('completedLessons')}</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>
                                {courses.filter(c => getCourseProgress(c.id).percent === 100).length}
                            </Text>
                            <Text style={styles.summaryLabel}>{t('coursesDone')}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{t('courseProgress')}</Text>

                {courses.map(course => {
                    const stats = getCourseProgress(course.id);
                    return (
                        <View key={course.id} style={styles.courseCard}>
                            <View style={styles.courseHeader}>
                                <Text style={styles.courseTitle}>{t(course.title as any)}</Text>
                                <Text style={styles.coursePercent}>{stats.percent}%</Text>
                            </View>

                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${stats.percent}%` }]} />
                            </View>

                            <Text style={styles.courseStats}>
                                {stats.count} / {stats.total} {t('lessons')}
                            </Text>

                            {/* List completed lessons if any */}
                            {stats.count > 0 && (
                                <View style={styles.completedList}>
                                    <View style={styles.completedHeader}>
                                        <CheckCircle size={14} color={colors.tint} />
                                        <Text style={styles.completedLabel}>{t('completed')}:</Text>
                                    </View>
                                    {/* We could list lesson names here if we map IDs back to lesson objects */}
                                    {/* For now, just a summary is good, or we can list them if we have lesson data available easily */}
                                    {/* The mock data 'lessons' is a flat list */}
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
    },
    errorText: {
        color: colors.text,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.tint,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 20,
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: colors.border,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.tint,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    courseCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
        marginRight: 10,
    },
    coursePercent: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.tint,
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.tint,
        borderRadius: 4,
    },
    courseStats: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    completedList: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    completedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    completedLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
});
