import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAuthScreen = segments[0] === 'auth';

        if (!user && !inAuthScreen) {
            // @ts-ignore - auth route exists
            router.replace('/auth');
        } else if (user && inAuthScreen) {
            // @ts-ignore - tabs route exists
            router.replace('/(tabs)');
        }
    }, [user, isLoading, segments]);

    if (isLoading) return null;

    return <>{children}</>;
}

function RootLayoutNav() {
    const { colors } = useTheme();

    return (
        <AuthGate>
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: colors.card },
                    headerTintColor: colors.text,
                    headerTitleStyle: { color: colors.text },
                    headerBackTitle: "Back",
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="course/[courseId]"
                    options={{
                        headerShown: true,
                        headerTitle: "Course Details",
                        headerBackTitle: "Back",
                    }}
                />
                <Stack.Screen
                    name="lesson/[lessonId]"
                    options={{
                        headerShown: true,
                        headerTitle: "Lesson",
                        headerBackTitle: "Back",
                    }}
                />
                <Stack.Screen
                    name="quiz/[lessonId]"
                    options={{
                        headerShown: true,
                        headerTitle: "Quiz",
                        headerBackTitle: "Back",
                        presentation: "modal",
                    }}
                />
                <Stack.Screen
                    name="student/[id]"
                    options={{
                        headerShown: true,
                        headerTitle: "Student Details",
                        headerBackTitle: "Back",
                    }}
                />
            </Stack>
        </AuthGate>
    );
}

export default function RootLayout() {
    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <LanguageProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            <ProgressProvider>
                                <RootLayoutNav />
                            </ProgressProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </LanguageProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
