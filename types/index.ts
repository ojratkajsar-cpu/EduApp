export type UserRole = 'student' | 'admin';

export type Category = 'mathematics' | 'physics' | 'languages';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    createdAt: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    category: Category;
    thumbnailUrl: string;
    lessonsCount: number;
    duration: string;
    level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    description: string;
    videoId: string;
    duration: string;
    order: number;
}

export interface Quiz {
    id: string;
    lessonId: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface LessonProgress {
    lessonId: string;
    completed: boolean;
    quizPassed: boolean;
    completedAt?: string;
}

export interface UserProgress {
    courseId: string;
    lessonsProgress: LessonProgress[];
}
