import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, GraduationCap, Users, School, Globe } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

type Role = 'student' | 'teacher' | 'parent';

const ROLES: { id: Role; icon: any; labelKey: string }[] = [
    { id: 'student', icon: GraduationCap, labelKey: 'student' },
    { id: 'teacher', icon: School, labelKey: 'teacher' },
    { id: 'parent', icon: Users, labelKey: 'parent' },
];

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role>('student');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signIn, signUp, signOut } = useAuth();
    const { colors } = useTheme();
    const { t, language, setLanguage } = useLanguage();

    const styles = makeStyles(colors);

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert(t('error'), t('fillAllFields'));
            return;
        }
        if (!isLogin && !fullName) {
            Alert.alert(t('error'), t('fillAllFields'));
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) {
                    Alert.alert(t('error'), error.message);
                }
            } else {
                const { error } = await signUp(email, password, fullName, selectedRole);
                if (error) {
                    Alert.alert(t('error'), error.message);
                } else {
                    Alert.alert(t('success'), t('registrationSuccess'));
                }
            }
        } catch (e) {
            Alert.alert(t('error'), 'An unexpected error occurred');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };



    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Language Switcher */}
                <View style={styles.languageContainer}>
                    <TouchableOpacity
                        style={[styles.langButton, language === 'ru' && styles.langButtonActive]}
                        onPress={() => setLanguage('ru')}
                    >
                        <Text style={[styles.langText, language === 'ru' && styles.langTextActive]}>RU</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.langButton, language === 'kk' && styles.langButtonActive]}
                        onPress={() => setLanguage('kk')}
                    >
                        <Text style={[styles.langText, language === 'kk' && styles.langTextActive]}>KK</Text>
                    </TouchableOpacity>
                </View>

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <BookOpen color="#FFF" size={32} />
                    </View>
                    <Text style={styles.appName}>EduApp</Text>
                    <Text style={styles.appTagline}>
                        {isLogin ? t('welcomeBack') : t('createAccount')}
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>
                        {isLogin ? t('signIn') : t('signUp')}
                    </Text>

                    {/* Role Selection - only for registration */}
                    {!isLogin && (
                        <View style={styles.roleSection}>
                            <Text style={styles.roleLabel}>{t('selectRole')}</Text>
                            <View style={styles.roleContainer}>
                                {ROLES.map((role) => {
                                    const RoleIcon = role.icon;
                                    const isSelected = selectedRole === role.id;
                                    return (
                                        <TouchableOpacity
                                            key={role.id}
                                            style={[
                                                styles.roleButton,
                                                isSelected && styles.roleButtonActive,
                                            ]}
                                            onPress={() => setSelectedRole(role.id)}
                                            activeOpacity={0.7}
                                        >
                                            <RoleIcon
                                                color={isSelected ? '#FFF' : colors.textSecondary}
                                                size={18}
                                            />
                                            <Text
                                                style={[
                                                    styles.roleButtonText,
                                                    isSelected && styles.roleButtonTextActive,
                                                ]}
                                            >
                                                {t(role.labelKey as any)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {!isLogin && (
                        <View style={styles.inputContainer}>
                            <User color={colors.textSecondary} size={18} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('fullName')}
                                placeholderTextColor={colors.textSecondary}
                                value={fullName}
                                onChangeText={setFullName}
                                autoCapitalize="words"
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Mail color={colors.textSecondary} size={18} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('email')}
                            placeholderTextColor={colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Lock color={colors.textSecondary} size={18} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('password')}
                            placeholderTextColor={colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            {showPassword ? (
                                <EyeOff color={colors.textSecondary} size={18} />
                            ) : (
                                <Eye color={colors.textSecondary} size={18} />
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                {isLogin ? t('signIn') : t('signUp')}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setIsLogin(!isLogin);
                            setFullName('');
                            setSelectedRole('student');
                        }}
                        style={styles.switchButton}
                    >
                        <Text style={styles.switchText}>
                            {isLogin ? t('noAccount') : t('hasAccount')}
                            <Text style={styles.switchTextBold}>
                                {isLogin ? t('signUp') : t('signIn')}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>



            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    languageContainer: {
        position: 'absolute',
        top: 50,
        right: 24,
        flexDirection: 'row',
        gap: 8,
        zIndex: 10,
    },
    langButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    langButtonActive: {
        backgroundColor: colors.tint,
        borderColor: colors.tint,
    },
    langText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    langTextActive: {
        color: '#FFF',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.tint,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: colors.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    appName: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
        letterSpacing: -0.5,
    },
    appTagline: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    formCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 4,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    roleSection: {
        marginBottom: 16,
    },
    roleLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 8,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    roleButton: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        gap: 4,
    },
    roleButtonActive: {
        backgroundColor: colors.tint,
        borderColor: colors.tint,
    },
    roleButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    roleButtonTextActive: {
        color: '#FFF',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
    },
    submitButton: {
        backgroundColor: colors.tint,
        borderRadius: 12,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: colors.tint,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFF',
    },
    switchButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    switchText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    switchTextBold: {
        color: colors.tint,
        fontWeight: '600',
    },

});
