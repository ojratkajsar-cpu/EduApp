import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Colors from '@/constants/colors';
import { lessons, courses, getQuizByLesson } from '@/mocks/courses';
import { useProgress } from '@/contexts/ProgressContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function QuizScreen() {
    const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
    const router = useRouter();
    const { markLessonComplete } = useProgress();
    const { t } = useLanguage();
    const { colors, theme } = useTheme();

    const styles = makeStyles(colors);

    const lesson = lessons.find(l => l.id === lessonId);
    const course = lesson ? courses.find(c => c.id === lesson.courseId) : null;
    const quiz = lesson ? getQuizByLesson(lesson.id) : null;

    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [shakeAnim] = useState(new Animated.Value(0));

    const triggerHaptic = useCallback((type: 'success' | 'error') => {
        if (Platform.OS !== 'web') {
            if (type === 'success') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        }
    }, []);

    const shake = useCallback(() => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    }, [shakeAnim]);

    if (!lesson || !course || !quiz) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{t('quizNotFound')}</Text>
            </View>
        );
    }

    const handleSelectAnswer = (index: number) => {
        if (showResult) return;

        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;

        const correct = selectedAnswer === quiz.correctAnswerIndex;
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            triggerHaptic('success');
            markLessonComplete(course.id, lesson.id, true);
        } else {
            triggerHaptic('error');
            shake();
        }
    };

    const handleRetry = () => {
        setSelectedAnswer(null);
        setShowResult(false);
        setIsCorrect(false);
    };

    const handleContinue = () => {
        router.back();
    };

    const getOptionStyle = (index: number) => {
        if (!showResult) {
            return selectedAnswer === index ? styles.optionSelected : styles.option;
        }

        if (index === quiz.correctAnswerIndex) {
            return styles.optionCorrect;
        }

        if (index === selectedAnswer && !isCorrect) {
            return styles.optionWrong;
        }

        return styles.option;
    };

    return (
        <>
            <Stack.Screen options={{ headerTitle: t('quiz'), headerBackTitle: t('back') }} />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.courseName}>{t(course.title as any)}</Text>
                    <Text style={styles.lessonName}>{t(lesson.title as any)}</Text>
                </View>

                <Animated.View style={[styles.quizCard, { transform: [{ translateX: shakeAnim }] }]}>
                    <View style={styles.questionBadge}>
                        <Text style={styles.questionBadgeText}>{t('question')}</Text>
                    </View>
                    <Text style={styles.question}>{t(quiz.question as any)}</Text>

                    <View style={styles.options}>
                        {quiz.options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={getOptionStyle(index)}
                                onPress={() => handleSelectAnswer(index)}
                                activeOpacity={0.7}
                                disabled={showResult}
                            >
                                <View style={styles.optionIndicator}>
                                    {showResult && index === quiz.correctAnswerIndex ? (
                                        <CheckCircle2 color={colors.success} size={22} />
                                    ) : showResult && index === selectedAnswer && !isCorrect ? (
                                        <XCircle color={colors.error} size={22} />
                                    ) : (
                                        <View style={[
                                            styles.optionCircle,
                                            selectedAnswer === index && !showResult && styles.optionCircleSelected
                                        ]} />
                                    )}
                                </View>
                                <Text style={[
                                    styles.optionText,
                                    showResult && index === quiz.correctAnswerIndex && styles.optionTextCorrect,
                                    showResult && index === selectedAnswer && !isCorrect && styles.optionTextWrong,
                                ]}>
                                    {t(option as any)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {showResult && (
                    <View style={[styles.resultCard, isCorrect ? styles.resultCorrect : styles.resultWrong]}>
                        {isCorrect ? (
                            <>
                                <CheckCircle2 color={colors.success} size={32} />
                                <Text style={styles.resultTitle}>{t('correct')}</Text>
                                <Text style={styles.resultText}>{t('greatJob')}</Text>
                            </>
                        ) : (
                            <>
                                <XCircle color={colors.error} size={32} />
                                <Text style={[styles.resultTitle, { color: colors.error }]}>{t('notQuite')}</Text>
                                <Text style={styles.resultText}>{t('dontWorry')}</Text>
                            </>
                        )}
                    </View>
                )}

                <View style={styles.footer}>
                    {!showResult ? (
                        <TouchableOpacity
                            style={[styles.submitButton, selectedAnswer === null && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={selectedAnswer === null}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.submitButtonText}>{t('checkAnswer')}</Text>
                        </TouchableOpacity>
                    ) : isCorrect ? (
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleContinue}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.continueButtonText}>{t('continue')}</Text>
                            <ArrowRight color="#FFF" size={20} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={handleRetry}
                            activeOpacity={0.8}
                        >
                            <RefreshCw color="#FFF" size={20} />
                            <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
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
    header: {
        marginBottom: 24,
    },
    courseName: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    lessonName: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    quizCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    questionBadge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.theme === 'dark' ? '#1E3A8A' : '#E0F2FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 16,
    },
    questionBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.tint,
    },
    question: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        lineHeight: 26,
        marginBottom: 24,
    },
    options: {
        gap: 12,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 14,
        padding: 16,
        borderWidth: 2,
        borderColor: colors.border,
    },
    optionSelected: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.theme === 'dark' ? '#172554' : '#E0F2FE',
        borderRadius: 14,
        padding: 16,
        borderWidth: 2,
        borderColor: colors.tint,
    },
    optionCorrect: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.theme === 'dark' ? '#064E3B' : '#D1FAE5',
        borderRadius: 14,
        padding: 16,
        borderWidth: 2,
        borderColor: colors.success,
    },
    optionWrong: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.theme === 'dark' ? '#7F1D1D' : '#FEE2E2',
        borderRadius: 14,
        padding: 16,
        borderWidth: 2,
        borderColor: colors.error,
    },
    optionIndicator: {
        marginRight: 14,
    },
    optionCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.border,
    },
    optionCircleSelected: {
        borderColor: colors.tint,
        backgroundColor: colors.tint,
    },
    optionText: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
    },
    optionTextCorrect: {
        color: colors.success,
        fontWeight: '600',
    },
    optionTextWrong: {
        color: colors.error,
    },
    resultCard: {
        marginTop: 20,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    resultCorrect: {
        backgroundColor: colors.theme === 'dark' ? '#064E3B' : '#F0FDF4',
        borderWidth: 1,
        borderColor: colors.theme === 'dark' ? '#059669' : '#BBF7D0',
    },
    resultWrong: {
        backgroundColor: colors.theme === 'dark' ? '#7F1D1D' : '#FEF2F2',
        borderWidth: 1,
        borderColor: colors.theme === 'dark' ? '#991B1B' : '#FECACA',
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.success,
        marginTop: 8,
    },
    resultText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 20,
    },
    submitButton: {
        backgroundColor: colors.tint,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: colors.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: colors.border,
        shadowOpacity: 0,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.success,
        paddingVertical: 16,
        borderRadius: 14,
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.error,
        paddingVertical: 16,
        borderRadius: 14,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});
