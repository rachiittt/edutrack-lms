import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetails from './pages/CourseDetails';
import CreateCourse from './pages/CreateCourse';
import MyCourses from './pages/MyCourses';
import QuizPage from './pages/QuizPage';
import QuizResults from './pages/QuizResults';
import MyResults from './pages/MyResults';
import NotFound from './pages/NotFound';
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--toast-bg, #fff)',
              color: 'var(--toast-color, #1e293b)',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
              padding: '14px 20px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/my-results" element={<MyResults />} />
            <Route
              path="/create-course"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <CreateCourse />
                </ProtectedRoute>
              }
            />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/quiz/:id/results" element={<QuizResults />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
export default App;
