import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, Search, Trash2, BookOpen, Award, TrendingUp, Users, Clock } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { courses } from '@/mocks/courses';

interface LinkedStudent {
    id: string;
    student_id: string;
    status: string;
    profile: {
        full_name: string;
    };
    progress: {
        completed_count: number;
        total_lessons: number;
        percentage: number;
    };
}

export default function StudentsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const [students, setStudents] = useState<LinkedStudent[]>([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    const styles = makeStyles(colors);

    const totalLessons = courses.reduce((acc, c) => acc + c.lessonsCount, 0);

    useEffect(() => {
        if (user) {
            loadStudents();
        }
    }, [user]);

    const loadStudents = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { data: links } = await supabase
                .from('user_links')
                .select('id, student_id, status')
                .eq('parent_id', user.id);

            if (!links || links.length === 0) {
                setStudents([]);
                setLoading(false);
                return;
            }

            const studentIds = links.map(l => l.student_id);

            // Get profiles
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', studentIds);

            // Get progress
            const { data: progressData } = await supabase
                .from('user_progress')
                .select('user_id, completed')
                .in('user_id', studentIds)
                .eq('completed', true);

            const result = links.map(link => {
                const profile = profiles?.find(p => p.id === link.student_id);
                const completedCount = progressData?.filter(
                    p => p.user_id === link.student_id
                ).length || 0;

                return {
                    id: link.id,
                    student_id: link.student_id,
                    status: (link as any).status || 'pending',
                    profile: {
                        full_name: profile?.full_name || t('student') || 'Ученик',
                    },
                    progress: {
                        completed_count: completedCount,
                        total_lessons: totalLessons,
                        percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
                    },
                };
            });

            setStudents(result);
        } catch (err) {
            console.error('Error loading students:', err);
        } finally {
            setLoading(false);
        }
    };

    const addStudent = async () => {
        if (!searchEmail.trim() || !user) {
            Alert.alert(t('error') || 'Ошибка', t('enterStudentEmail') || 'Введите email ученика');
            return;
        }

        setAdding(true);
        try {
            // Find user by email via profiles + auth
            const { data: users } = await supabase
                .from('profiles')
                .select('id, full_name')
                .limit(50);

            // We need to find user by email through auth - use a workaround
            // Search in auth.users isn't directly available from client
            // So we'll use the admin approach - search by the user metadata
            const { data: authData } = await supabase.auth.admin?.listUsers?.() || { data: null };

            // Alternative approach - look up user by trying to find them
            // For now, use the Supabase edge function or direct lookup

            // Simple approach: find profile by name match (since we can't search auth.users from client)
            const emailLower = searchEmail.trim().toLowerCase();

            // Try RPC or direct method
            const { data: foundUserData, error: searchError } = await supabase.rpc('find_user_by_email', {
                search_email: emailLower
            }).single();

            const foundUser = foundUserData as any;

            if (searchError || !foundUser) {
                Alert.alert(
                    t('error') || 'Ошибка',
                    t('studentNotFound') || 'Ученик с таким email не найден'
                );
                setAdding(false);
                return;
            }

            if (foundUser.id === user.id) {
                Alert.alert(t('error') || 'Ошибка', t('cantAddYourself') || 'Нельзя добавить себя');
                setAdding(false);
                return;
            }

            // Add link
            const { error: linkError } = await supabase
                .from('user_links')
                .insert({
                    parent_id: user.id,
                    student_id: foundUser.id,
                });

            if (linkError) {
                if (linkError.code === '23505') {
                    Alert.alert(t('error') || 'Ошибка', t('studentAlreadyLinked') || 'Ученик уже добавлен');
                } else {
                    Alert.alert(t('error') || 'Ошибка', linkError.message);
                }
            } else {
                setSearchEmail('');
                Alert.alert(t('success') || 'Успех', t('studentAdded') || 'Ученик добавлен!');
                loadStudents();
            }
        } catch (err) {
            console.error('Error adding student:', err);
            Alert.alert(t('error') || 'Ошибка', t('studentNotFound') || 'Ученик не найден');
        } finally {
            setAdding(false);
        }
    };

    const removeStudent = async (linkId: string) => {
        const { error } = await supabase
            .from('user_links')
            .delete()
            .eq('id', linkId);

        if (!error) {
            loadStudents();
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.tint} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{t('myStudents') || 'Мои ученики'}</Text>
                    <Text style={styles.headerSubtitle}>
                        {t('trackStudentProgress') || 'Отслеживайте прогресс учеников'}
                    </Text>
                </View>

                {/* Add Student */}
                <View style={styles.addSection}>
                    <Text style={styles.sectionTitle}>
                        {t('addStudent') || 'Добавить ученика'}
                    </Text>
                    <View style={styles.searchRow}>
                        <View style={styles.searchInputContainer}>
                            <Search color={colors.textSecondary} size={18} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={t('studentEmail') || 'Email ученика'}
                                placeholderTextColor={colors.textSecondary}
                                value={searchEmail}
                                onChangeText={setSearchEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={addStudent}
                            disabled={adding}
                        >
                            {adding ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <UserPlus color="#FFF" size={20} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Students List */}
                {students.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Users color={colors.textSecondary} size={48} />
                        <Text style={styles.emptyText}>
                            {t('noStudentsYet') || 'Пока нет учеников'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {t('addStudentByEmail') || 'Добавьте ученика по email'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.studentsList}>
                        <Text style={styles.sectionTitle}>
                            {t('students') || 'Ученики'} ({students.length})
                        </Text>
                        {students.map((student) => (
                            <TouchableOpacity
                                key={student.id}
                                style={styles.studentCard}
                                activeOpacity={0.7}
                                // @ts-ignore
                                onPress={() => router.push(`/student/${student.student_id}`)}
                            >
                                <View style={styles.studentHeader}>
                                    <View style={styles.studentAvatar}>
                                        <Text style={styles.studentAvatarText}>
                                            {student.profile.full_name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.studentInfo}>
                                        <Text style={styles.studentName}>
                                            {student.profile.full_name}
                                        </Text>
                                        <Text style={styles.studentProgress}>
                                            {t('progress')}: {student.progress.percentage}%
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => removeStudent(student.id)}
                                        style={styles.removeButton}
                                    >
                                        <Trash2 color={colors.error} size={18} />
                                    </TouchableOpacity>
                                </View>

                                {/* Status badge */}
                                {student.status !== 'approved' && (
                                    <View style={[
                                        styles.statusBadge,
                                        student.status === 'pending' ? styles.statusPending : styles.statusRejected,
                                    ]}>
                                        <Clock color={student.status === 'pending' ? '#F59E0B' : '#EF4444'} size={14} />
                                        <Text style={[
                                            styles.statusText,
                                            student.status === 'pending' ? styles.statusTextPending : styles.statusTextRejected,
                                        ]}>
                                            {student.status === 'pending'
                                                ? (t('requestPending'))
                                                : (t('rejected'))
                                            }
                                        </Text>
                                    </View>
                                )}

                                {/* Progress bar - only for approved */}
                                {student.status === 'approved' && (
                                    <>
                                        <View style={styles.progressBarContainer}>
                                            <View style={styles.progressBarBg}>
                                                <View
                                                    style={[
                                                        styles.progressBarFill,
                                                        { width: `${student.progress.percentage}%` },
                                                    ]}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.statsRow}>
                                            <View style={styles.statItem}>
                                                <BookOpen color={colors.tint} size={16} />
                                                <Text style={styles.statText}>
                                                    {student.progress.completed_count}/{student.progress.total_lessons} {t('lessons')}
                                                </Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Award color={colors.accent} size={16} />
                                                <Text style={styles.statText}>
                                                    {student.progress.percentage}% {t('completed')}
                                                </Text>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
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
    },
    header: {
        padding: 20,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    addSection: {
        padding: 20,
        paddingTop: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    searchRow: {
        flexDirection: 'row',
        gap: 10,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 48,
        gap: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.tint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
        gap: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    studentsList: {
        padding: 20,
        paddingTop: 0,
    },
    studentCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    studentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    studentAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.tint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    studentAvatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    studentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    studentProgress: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    removeButton: {
        padding: 8,
    },
    progressBarContainer: {
        marginBottom: 12,
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: colors.tint,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 4,
        marginTop: 4,
    },
    statusPending: {
        backgroundColor: '#FEF3C7',
    },
    statusRejected: {
        backgroundColor: '#FEE2E2',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusTextPending: {
        color: '#D97706',
    },
    statusTextRejected: {
        color: '#DC2626',
    },
});
