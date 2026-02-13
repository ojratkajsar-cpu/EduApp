import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Award, BookOpen, Clock, ChevronRight, Settings, HelpCircle, LogOut, Globe, Check, Moon, Sun, X } from 'lucide-react-native';
import { useProgress } from '@/contexts/ProgressContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { courses } from '@/mocks/courses';
import { languages, Language } from '@/constants/translations';
import TrackingRequests from '@/components/TrackingRequests';

export default function ProfileScreen() {
    const { getOverallProgress, getCompletedCoursesCount, getCompletedLessonsCount, getCourseProgress } = useProgress();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme, colors } = useTheme();
    const { user, signOut, profile } = useAuth();
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const completedCourses = courses.filter(c => getCourseProgress(c.id) === 100);
    const inProgressCourses = courses.filter(c => {
        const p = getCourseProgress(c.id);
        return p > 0 && p < 100;
    });

    const currentLanguage = languages.find(l => l.id === language);

    const handleLanguageSelect = (lang: Language) => {
        setLanguage(lang);
        setShowLanguageModal(false);
    };

    const mainMenuItems = [
        { id: 'settings', icon: Settings, label: t('settings'), color: colors.textSecondary },
        { id: 'help', icon: HelpCircle, label: t('helpSupport'), color: colors.textSecondary },
        { id: 'logout', icon: LogOut, label: t('logOut'), color: colors.error },
    ];

    const settingsItems = [
        { id: 'language', icon: Globe, label: t('language'), color: colors.tint, value: currentLanguage?.nativeLabel },
        { id: 'theme', icon: theme === 'dark' ? Moon : Sun, label: t('theme'), color: colors.accent, value: theme === 'dark' ? t('dark') : t('light') },
    ];

    const handleMenuPress = (id: string) => {
        if (id === 'settings') {
            setShowSettingsModal(true);
        } else if (id === 'logout') {
            signOut();
        }
    };

    const handleSettingsPress = (id: string) => {
        if (id === 'language') {
            setShowLanguageModal(true);
        } else if (id === 'theme') {
            toggleTheme();
        }
    };

    const styles = makeStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <User color="#FFF" size={40} />
                        </View>
                    </View>
                    <Text style={styles.userName}>{profile?.full_name || user?.user_metadata?.full_name || t('student')}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'student@example.com'}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{t(profile?.role as any) || t('student')}</Text>
                    </View>
                </View>

                {/* Tracking requests for students */}
                {(!profile?.role || profile?.role === 'student') && (
                    <TrackingRequests />
                )}

                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: theme === 'dark' ? '#1E3A8A' : '#E0F2FE' }]}>
                            <Award color={colors.tint} size={22} />
                        </View>
                        <Text style={styles.statValue}>{getOverallProgress()}%</Text>
                        <Text style={styles.statLabel}>{t('overallProgress')}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: theme === 'dark' ? '#064E3B' : '#D1FAE5' }]}>
                            <BookOpen color={colors.success} size={22} />
                        </View>
                        <Text style={styles.statValue}>{getCompletedCoursesCount()}</Text>
                        <Text style={styles.statLabel}>{t('coursesDone')}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: theme === 'dark' ? '#78350F' : '#FEF3C7' }]}>
                            <Clock color={colors.accent} size={22} />
                        </View>
                        <Text style={styles.statValue}>{getCompletedLessonsCount()}</Text>
                        <Text style={styles.statLabel}>{t('lessonsDone')}</Text>
                    </View>
                </View>

                {inProgressCourses.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('inProgress')}</Text>
                        {inProgressCourses.map(course => {
                            const progress = getCourseProgress(course.id);
                            return (
                                <View key={course.id} style={styles.progressItem}>
                                    <Image source={{ uri: course.thumbnailUrl }} style={styles.progressThumbnail} />
                                    <View style={styles.progressContent}>
                                        <Text style={styles.progressTitle} numberOfLines={1}>{t(course.title as any)}</Text>
                                        <View style={styles.progressBarRow}>
                                            <View style={styles.progressBarBg}>
                                                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                                            </View>
                                            <Text style={styles.progressPercent}>{progress}%</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={styles.menuSection}>
                    {mainMenuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            activeOpacity={0.7}
                            onPress={() => handleMenuPress(item.id)}
                        >
                            <View style={styles.menuLeft}>
                                <item.icon color={item.color} size={22} />
                                <Text style={[styles.menuLabel, item.id === 'logout' && { color: colors.error }]}>
                                    {item.label}
                                </Text>
                            </View>
                            <View style={styles.menuRight}>
                                {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                                <ChevronRight color={colors.textSecondary} size={20} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>EduLearn v1.0.0</Text>
                </View>
            </ScrollView>

            {/* Settings Modal */}
            <Modal
                visible={showSettingsModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSettingsModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSettingsModal(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('settings')}</Text>
                            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                                <X color={colors.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.settingsList}>
                            {settingsItems.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.menuItem}
                                    activeOpacity={0.7}
                                    onPress={() => handleSettingsPress(item.id)}
                                >
                                    <View style={styles.menuLeft}>
                                        <item.icon color={item.color} size={22} />
                                        <Text style={styles.menuLabel}>{item.label}</Text>
                                    </View>
                                    <View style={styles.menuRight}>
                                        <Text style={styles.menuValue}>{item.value}</Text>
                                        <ChevronRight color={colors.textSecondary} size={20} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Language Selection Modal */}
            <Modal
                visible={showLanguageModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowLanguageModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.id}
                                style={[
                                    styles.languageOption,
                                    language === lang.id && styles.languageOptionActive,
                                ]}
                                onPress={() => handleLanguageSelect(lang.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.languageInfo}>
                                    <Text style={[
                                        styles.languageNative,
                                        language === lang.id && styles.languageTextActive,
                                    ]}>
                                        {lang.nativeLabel}
                                    </Text>
                                    <Text style={styles.languageLabel}>{lang.label}</Text>
                                </View>
                                {language === lang.id && (
                                    <Check color={colors.tint} size={22} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
        backgroundColor: colors.card,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    avatarContainer: {
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.tint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
    },
    userEmail: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    roleBadge: {
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: colors.tint + '20',
        borderRadius: 16,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.tint,
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 24,
        gap: 12,
    },
    statItem: {
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
    statIcon: {
        width: 44,
        height: 44,
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
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
        textAlign: 'center',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    progressItem: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    progressThumbnail: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: colors.border,
    },
    progressContent: {
        flex: 1,
        marginLeft: 12,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 6,
    },
    progressBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
        borderRadius: 3,
    },
    progressPercent: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.tint,
        width: 36,
    },
    completedItem: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    completedIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.success + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    completedContent: {
        flex: 1,
        marginLeft: 12,
    },
    completedTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    completedMeta: {
        fontSize: 12,
        color: colors.success,
        marginTop: 2,
    },
    menuSection: {
        marginTop: 24,
        marginHorizontal: 20,
        backgroundColor: colors.card,
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuLabel: {
        fontSize: 15,
        color: colors.text,
    },
    menuValue: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    footerText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxWidth: 320,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    settingsList: {
        width: '100%',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: colors.background,
    },
    languageOptionActive: {
        backgroundColor: colors.tint + '20',
        borderWidth: 1,
        borderColor: colors.tint,
    },
    languageInfo: {
        flex: 1,
    },
    languageNative: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    languageTextActive: {
        color: colors.tint,
    },
    languageLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
});
