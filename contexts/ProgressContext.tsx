import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { UserProgress, LessonProgress } from '@/types';
import { getLessonsByCourse, courses, lessons } from '@/mocks/courses';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const PROGRESS_STORAGE_KEY = 'user_progress';

export const [ProgressProvider, useProgress] = createContextHook(() => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const progressQuery = useQuery({
        queryKey: ['progress'],
        queryFn: async (): Promise<UserProgress[]> => {
            try {
                const stored = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
                return stored ? JSON.parse(stored) : [];
            } catch (error) {
                console.log('Error loading progress:', error);
                return [];
            }
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (progress: UserProgress[]) => {
            await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
            return progress;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['progress'], data);
        },
    });

    const progress = progressQuery.data ?? [];

    const markLessonComplete = useCallback((courseId: string, lessonId: string, quizPassed: boolean) => {
        const currentProgress = [...progress];
        const courseProgressIndex = currentProgress.findIndex(p => p.courseId === courseId);

        const lessonProgress: LessonProgress = {
            lessonId,
            completed: true,
            quizPassed,
            completedAt: new Date().toISOString(),
        };

        if (courseProgressIndex === -1) {
            currentProgress.push({
                courseId,
                lessonsProgress: [lessonProgress],
            });
        } else {
            const existingLessonIndex = currentProgress[courseProgressIndex].lessonsProgress.findIndex(
                lp => lp.lessonId === lessonId
            );
            if (existingLessonIndex === -1) {
                currentProgress[courseProgressIndex].lessonsProgress.push(lessonProgress);
            } else {
                currentProgress[courseProgressIndex].lessonsProgress[existingLessonIndex] = lessonProgress;
            }
        }

        saveMutation.mutate(currentProgress);

        // Синхронизируем прогресс в Supabase, чтобы учителя/родители могли его видеть
        if (user) {
            supabase
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    course_id: courseId,
                    lesson_id: lessonId,
                    completed: true,
                    quiz_passed: quizPassed,
                    completed_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id,course_id,lesson_id',
                })
                .then(({ error }) => {
                    if (error) {
                        console.error('Ошибка сохранения прогресса в Supabase:', error);
                    }
                });
        }
    }, [progress, saveMutation, user]);

    const getCourseProgress = useCallback((courseId: string): number => {
        const courseProgress = progress.find(p => p.courseId === courseId);
        if (!courseProgress) return 0;

        const courseLessons = getLessonsByCourse(courseId);
        if (courseLessons.length === 0) return 0;

        const completedLessons = courseProgress.lessonsProgress.filter(lp => lp.completed && lp.quizPassed).length;
        return Math.round((completedLessons / courseLessons.length) * 100);
    }, [progress]);

    const isLessonCompleted = useCallback((courseId: string, lessonId: string): boolean => {
        const courseProgress = progress.find(p => p.courseId === courseId);
        if (!courseProgress) return false;

        const lessonProgress = courseProgress.lessonsProgress.find(lp => lp.lessonId === lessonId);
        return lessonProgress?.completed && lessonProgress?.quizPassed || false;
    }, [progress]);

    const getOverallProgress = useCallback((): number => {
        if (courses.length === 0) return 0;
        const totalProgress = courses.reduce((sum, course) => sum + getCourseProgress(course.id), 0);
        return Math.round(totalProgress / courses.length);
    }, [getCourseProgress]);

    const getCompletedCoursesCount = useCallback((): number => {
        return courses.filter(course => getCourseProgress(course.id) === 100).length;
    }, [getCourseProgress]);

    const getCompletedLessonsCount = useCallback((): number => {
        const allLessonIds = lessons.map(l => l.id);
        return progress.reduce((sum, p) => {
            const validLessons = p.lessonsProgress.filter(
                lp => lp.completed && lp.quizPassed && allLessonIds.includes(lp.lessonId)
            );
            return sum + validLessons.length;
        }, 0);
    }, [progress]);

    return {
        progress,
        isLoading: progressQuery.isLoading,
        markLessonComplete,
        getCourseProgress,
        isLessonCompleted,
        getOverallProgress,
        getCompletedCoursesCount,
        getCompletedLessonsCount,
    };
});
