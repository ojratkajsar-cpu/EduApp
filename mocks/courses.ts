import { Course, Lesson, Quiz } from '@/types';

export const courses: Course[] = [
    {
        id: 'math-1',
        title: 'course-math-1-title',
        description: 'course-math-1-desc',
        category: 'mathematics',
        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
        lessonsCount: 3,
        duration: '2h 30m',
        level: 'beginner',
    },
    {
        id: 'math-2',
        title: 'course-math-2-title',
        description: 'course-math-2-desc',
        category: 'mathematics',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
        lessonsCount: 3,
        duration: '1h 45m',
        level: 'intermediate',
    },
    {
        id: 'physics-1',
        title: 'course-physics-1-title',
        description: 'course-physics-1-desc',
        category: 'physics',
        thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop',
        lessonsCount: 3,
        duration: '3h 15m',
        level: 'beginner',
    },
    {
        id: 'physics-2',
        title: 'course-physics-2-title',
        description: 'course-physics-2-desc',
        category: 'physics',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&h=300&fit=crop',
        lessonsCount: 3,
        duration: '2h 00m',
        level: 'advanced',
    },
    {
        id: 'lang-1',
        title: 'course-lang-1-title',
        description: 'course-lang-1-desc',
        category: 'languages',
        thumbnailUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop',
        lessonsCount: 3,
        duration: '2h 45m',
        level: 'beginner',
    },
    {
        id: 'lang-2',
        title: 'course-lang-2-title',
        description: 'course-lang-2-desc',
        category: 'languages',
        thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
        lessonsCount: 3,
        duration: '1h 30m',
        level: 'intermediate',
    },
];

export const lessons: Lesson[] = [
    // Calculus Fundamentals
    { id: 'math-1-1', courseId: 'math-1', title: 'lesson-math-1-1-title', description: 'lesson-math-1-1-desc', videoId: '8hBEpVKMDLg', duration: '12:30', order: 1 },
    { id: 'math-1-2', courseId: 'math-1', title: 'lesson-math-1-2-title', description: 'lesson-math-1-2-desc', videoId: '8hBEpVKMDLg', duration: '15:45', order: 2 },
    { id: 'math-1-3', courseId: 'math-1', title: 'lesson-math-1-3-title', description: 'lesson-math-1-3-desc', videoId: '8hBEpVKMDLg', duration: '18:20', order: 3 },


    // Linear Algebra
    { id: 'math-2-1', courseId: 'math-2', title: 'lesson-math-2-1-title', description: 'lesson-math-2-1-desc', videoId: 'cJslkj9_wyg', duration: '14:00', order: 1 },
    { id: 'math-2-2', courseId: 'math-2', title: 'lesson-math-2-2-title', description: 'lesson-math-2-2-desc', videoId: 'cJslkj9_wyg', duration: '16:30', order: 2 },
    { id: 'math-2-3', courseId: 'math-2', title: 'lesson-math-2-3-title', description: 'lesson-math-2-3-desc', videoId: 'cJslkj9_wyg', duration: '19:15', order: 3 },

    // Classical Mechanics
    { id: 'physics-1-1', courseId: 'physics-1', title: 'lesson-physics-1-1-title', description: 'lesson-physics-1-1-desc', videoId: 'eVgokiqERI8', duration: '11:45', order: 1 },
    { id: 'physics-1-2', courseId: 'physics-1', title: 'lesson-physics-1-2-title', description: 'lesson-physics-1-2-desc', videoId: 'eVgokiqERI8', duration: '13:20', order: 2 },
    { id: 'physics-1-3', courseId: 'physics-1', title: 'lesson-physics-1-3-title', description: 'lesson-physics-1-3-desc', videoId: 'eVgokiqERI8', duration: '17:00', order: 3 },


    // Quantum Physics
    { id: 'physics-2-1', courseId: 'physics-2', title: 'lesson-physics-2-1-title', description: 'lesson-physics-2-1-desc', videoId: 'dQw4w9WgXcQ', duration: '18:00', order: 1 },
    { id: 'physics-2-2', courseId: 'physics-2', title: 'lesson-physics-2-2-title', description: 'lesson-physics-2-2-desc', videoId: 'dQw4w9WgXcQ', duration: '16:45', order: 2 },
    { id: 'physics-2-3', courseId: 'physics-2', title: 'lesson-physics-2-3-title', description: 'lesson-physics-2-3-desc', videoId: 'dQw4w9WgXcQ', duration: '22:00', order: 3 },

    // English for Beginners
    { id: 'lang-1-1', courseId: 'lang-1', title: 'lesson-lang-1-1-title', description: 'lesson-lang-1-1-desc', videoId: 'ATaNvqPSZEI', duration: '10:00', order: 1 },
    { id: 'lang-1-2', courseId: 'lang-1', title: 'lesson-lang-1-2-title', description: 'lesson-lang-1-2-desc', videoId: 'ATaNvqPSZEI', duration: '12:30', order: 2 },
    { id: 'lang-1-3', courseId: 'lang-1', title: 'lesson-lang-1-3-title', description: 'lesson-lang-1-3-desc', videoId: 'ATaNvqPSZEI', duration: '15:00', order: 3 },


    // Business English
    { id: 'lang-2-1', courseId: 'lang-2', title: 'lesson-lang-2-1-title', description: 'lesson-lang-2-1-desc', videoId: 'dQw4w9WgXcQ', duration: '14:00', order: 1 },
    { id: 'lang-2-2', courseId: 'lang-2', title: 'lesson-lang-2-2-title', description: 'lesson-lang-2-2-desc', videoId: 'dQw4w9WgXcQ', duration: '12:45', order: 2 },
    { id: 'lang-2-3', courseId: 'lang-2', title: 'lesson-lang-2-3-title', description: 'lesson-lang-2-3-desc', videoId: 'dQw4w9WgXcQ', duration: '16:30', order: 3 },
];

export const quizzes: Quiz[] = [
    { id: 'quiz-math-1-1', lessonId: 'math-1-1', question: 'quiz-math-1-1-q', options: ['quiz-math-1-1-o0', 'quiz-math-1-1-o1', 'quiz-math-1-1-o2', 'quiz-math-1-1-o3'], correctAnswerIndex: 0 },
    { id: 'quiz-math-1-2', lessonId: 'math-1-2', question: 'quiz-math-1-2-q', options: ['quiz-math-1-2-o0', 'quiz-math-1-2-o1', 'quiz-math-1-2-o2', 'quiz-math-1-2-o3'], correctAnswerIndex: 1 },
    { id: 'quiz-math-1-3', lessonId: 'math-1-3', question: 'quiz-math-1-3-q', options: ['quiz-math-1-3-o0', 'quiz-math-1-3-o1', 'quiz-math-1-3-o2', 'quiz-math-1-3-o3'], correctAnswerIndex: 1 },


    { id: 'quiz-math-2-1', lessonId: 'math-2-1', question: 'quiz-math-2-1-q', options: ['quiz-math-2-1-o0', 'quiz-math-2-1-o1', 'quiz-math-2-1-o2', 'quiz-math-2-1-o3'], correctAnswerIndex: 2 },
    { id: 'quiz-math-2-2', lessonId: 'math-2-2', question: 'quiz-math-2-2-q', options: ['quiz-math-2-2-o0', 'quiz-math-2-2-o1', 'quiz-math-2-2-o2', 'quiz-math-2-2-o3'], correctAnswerIndex: 1 },
    { id: 'quiz-math-2-3', lessonId: 'math-2-3', question: 'quiz-math-2-3-q', options: ['quiz-math-2-3-o0', 'quiz-math-2-3-o1', 'quiz-math-2-3-o2', 'quiz-math-2-3-o3'], correctAnswerIndex: 1 },

    { id: 'quiz-physics-1-1', lessonId: 'physics-1-1', question: 'quiz-physics-1-1-q', options: ['quiz-physics-1-1-o0', 'quiz-physics-1-1-o1', 'quiz-physics-1-1-o2', 'quiz-physics-1-1-o3'], correctAnswerIndex: 1 },
    { id: 'quiz-physics-1-2', lessonId: 'physics-1-2', question: 'quiz-physics-1-2-q', options: ['quiz-physics-1-2-o0', 'quiz-physics-1-2-o1', 'quiz-physics-1-2-o2', 'quiz-physics-1-2-o3'], correctAnswerIndex: 1 },
    { id: 'quiz-physics-1-3', lessonId: 'physics-1-3', question: 'quiz-physics-1-3-q', options: ['quiz-physics-1-3-o0', 'quiz-physics-1-3-o1', 'quiz-physics-1-3-o2', 'quiz-physics-1-3-o3'], correctAnswerIndex: 1 },


    { id: 'quiz-physics-2-1', lessonId: 'physics-2-1', question: 'quiz-physics-2-1-q', options: ['quiz-physics-2-1-o0', 'quiz-physics-2-1-o1', 'quiz-physics-2-1-o2', 'quiz-physics-2-1-o3'], correctAnswerIndex: 1 },
    { id: 'quiz-physics-2-2', lessonId: 'physics-2-2', question: 'quiz-physics-2-2-q', options: ['quiz-physics-2-2-o0', 'quiz-physics-2-2-o1', 'quiz-physics-2-2-o2', 'quiz-physics-2-2-o3'], correctAnswerIndex: 1 },
    { id: 'quiz-physics-2-3', lessonId: 'physics-2-3', question: 'quiz-physics-2-3-q', options: ['quiz-physics-2-3-o0', 'quiz-physics-2-3-o1', 'quiz-physics-2-3-o2', 'quiz-physics-2-3-o3'], correctAnswerIndex: 1 },

    { id: 'quiz-lang-1-1', lessonId: 'lang-1-1', question: 'quiz-lang-1-1-q', options: ['quiz-lang-1-1-o0', 'quiz-lang-1-1-o1', 'quiz-lang-1-1-o2', 'quiz-lang-1-1-o3'], correctAnswerIndex: 2 },
    { id: 'quiz-lang-1-2', lessonId: 'lang-1-2', question: 'quiz-lang-1-2-q', options: ['quiz-lang-1-2-o0', 'quiz-lang-1-2-o1', 'quiz-lang-1-2-o2', 'quiz-lang-1-2-o3'], correctAnswerIndex: 1 },
    { id: 'quiz-lang-1-3', lessonId: 'lang-1-3', question: 'quiz-lang-1-3-q', options: ['quiz-lang-1-3-o0', 'quiz-lang-1-3-o1', 'quiz-lang-1-3-o2', 'quiz-lang-1-3-o3'], correctAnswerIndex: 0 },


    { id: 'quiz-lang-2-1', lessonId: 'lang-2-1', question: 'quiz-lang-2-1-q', options: ['quiz-lang-2-1-o0', 'quiz-lang-2-1-o1', 'quiz-lang-2-1-o2', 'quiz-lang-2-1-o3'], correctAnswerIndex: 2 },
    { id: 'quiz-lang-2-2', lessonId: 'lang-2-2', question: 'quiz-lang-2-2-q', options: ['quiz-lang-2-2-o0', 'quiz-lang-2-2-o1', 'quiz-lang-2-2-o2', 'quiz-lang-2-2-o3'], correctAnswerIndex: 1 },
    { id: 'quiz-lang-2-3', lessonId: 'lang-2-3', question: 'quiz-lang-2-3-q', options: ['quiz-lang-2-3-o0', 'quiz-lang-2-3-o1', 'quiz-lang-2-3-o2', 'quiz-lang-2-3-o3'], correctAnswerIndex: 1 },
];

export const getLessonsByCourse = (courseId: string): Lesson[] => {
    return lessons.filter(lesson => lesson.courseId === courseId).sort((a, b) => a.order - b.order);
};

export const getQuizByLesson = (lessonId: string): Quiz | undefined => {
    return quizzes.find(quiz => quiz.lessonId === lessonId);
};

export const getCoursesByCategory = (category: string): Course[] => {
    if (category === 'all') return courses;
    return courses.filter(course => course.category === category);
};
