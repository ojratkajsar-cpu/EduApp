import { Tabs } from "expo-router";
import { Home, BookOpen, User, Users } from "lucide-react-native";
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
    const { t, language } = useLanguage();
    const { colors } = useTheme();
    const { profile } = useAuth();

    const isParentOrTeacher = profile?.role === 'parent' || profile?.role === 'teacher';

    return (
        <Tabs
            key={`${language}-${profile?.role}`}
            screenOptions={{
                tabBarActiveTintColor: colors.tint,
                tabBarInactiveTintColor: colors.tabIconDefault,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                    paddingTop: 4,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('home'),
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="courses"
                options={{
                    title: t('courses'),
                    tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="students"
                options={{
                    title: t('myStudents') || 'Ученики',
                    tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
                    // @ts-ignore
                    tabBarItemStyle: isParentOrTeacher ? {} : { display: 'none' },
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('profile'),
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
