import React, { useEffect } from 'react';
import './styles.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { MainLayout } from './layouts/MainLayout';
import AuthPage from './pages/AuthPage';
import WorkspacePage from './pages/WorkspacePage';
import ProjectPage from './pages/ProjectPage';
import ProfilePage from './pages/ProfilePage';
import { Overview } from './components/Overview';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskListView } from './components/TaskListView';
import { CalendarView } from './components/CalendarView';
import { TeamView } from './components/TeamView';
import { ActivityLogView } from './components/ActivityLogView';
import IntroPage from './pages/IntroPage';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { currentUser, isInitialAuthChecked } = useStore();
    if (isInitialAuthChecked && currentUser) {
        return <Navigate to="/workspace" />;
    }
    return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { currentUser, isLoading, isInitialAuthChecked, initializeAuth } = useStore();

    useEffect(() => {
        if (!isInitialAuthChecked && !isLoading) {
            initializeAuth();
        }
    }, [isInitialAuthChecked, isLoading, initializeAuth]);

    if (!isInitialAuthChecked) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/intro" />;
    }

    return <>{children}</>;
};

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/intro" element={<PublicRoute><IntroPage /></PublicRoute>} />
                <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

                <Route path="/" element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="/workspace" />} />
                    <Route path="workspace" element={<WorkspacePage />} />
                    <Route path="project/:id" element={<ProjectPage />}>
                        <Route index element={<Navigate to="board" replace />} />
                        <Route path="overview" element={<Overview />} />
                        <Route path="board" element={<KanbanBoard />} />
                        <Route path="list" element={<TaskListView />} />
                        <Route path="calendar" element={<CalendarView />} />
                        <Route path="team" element={<TeamView />} />
                        <Route path="activity" element={<ActivityLogView />} />
                    </Route>
                    <Route path="profile" element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}