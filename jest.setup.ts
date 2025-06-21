import '@testing-library/jest-dom';

// Mock next/font/google for Jest
jest.mock('next/font/google', () => ({
    Geist: () => ({ variable: 'mock-geist-sans' }),
    Geist_Mono: () => ({ variable: 'mock-geist-mono' }),
}));