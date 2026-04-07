import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BookOpen,
  Users,
  Trophy,
  TrendingUp,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, enrollments } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0 });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?.role === 'teacher') {
        const response = await courseService.getAll({ teacher: user._id, limit: 50 } as any);
        setCourses(response.data.courses);
        const totalStudents = response.data.courses.reduce(
          (sum: number, c: Course) => sum + c.enrollmentCount,
          0
        );
        setStats({ totalCourses: response.data.courses.length, totalStudents });
      } else {
        const response = await courseService.getAll({ limit: 6 });
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrolledCourseIds = enrollments.map((e) => 
    typeof e.course === 'object' ? e.course._id : e.course
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-accent-400/10 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-primary-200 text-lg max-w-xl">
            {user?.role === 'teacher'
              ? 'Manage your courses and track student progress from here.'
              : 'Ready to continue your learning journey? Pick up where you left off.'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role === 'teacher' ? (
          <>
            <StatCard
              icon={<BookOpen className="w-6 h-6" />}
              label="My Courses"
              value={stats.totalCourses.toString()}
              color="primary"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Total Students"
              value={stats.totalStudents.toString()}
              color="accent"
            />
            <StatCard
              icon={<Trophy className="w-6 h-6" />}
              label="Quizzes Created"
              value="—"
              color="amber"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Avg. Completion"
              value="—"
              color="rose"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={<BookOpen className="w-6 h-6" />}
              label="Enrolled Courses"
              value={enrollments.length.toString()}
              color="primary"
            />
            <StatCard
              icon={<Trophy className="w-6 h-6" />}
              label="Quizzes Completed"
              value="—"
              color="accent"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Avg. Score"
              value="—"
              color="amber"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Certificates"
              value="—"
              color="rose"
            />
          </>
        )}
      </div>

      {/* Quick Actions for Teacher */}
      {user?.role === 'teacher' && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/create-course')}
            className="btn-primary gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Create New Course
          </button>
          <button
            onClick={() => navigate('/courses')}
            className="btn-secondary gap-2"
          >
            Browse All Courses
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">
            {user?.role === 'teacher' ? 'Your Courses' : 'Recommended Courses'}
          </h2>
          <button
            onClick={() => navigate('/courses')}
            className="btn-ghost gap-1 text-sm"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2">
              {user?.role === 'teacher' ? 'No courses yet' : 'No courses available'}
            </h3>
            <p className="text-surface-500 dark:text-surface-400 mb-4">
              {user?.role === 'teacher'
                ? 'Create your first course to get started!'
                : 'Check back soon for new courses.'}
            </p>
            {user?.role === 'teacher' && (
              <button
                onClick={() => navigate('/create-course')}
                className="btn-primary gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Create Course
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isEnrolled={enrolledCourseIds.includes(course._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Enrolled Courses (Student) */}
      {user?.role === 'student' && enrollments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Continue Learning</h2>
            <button
              onClick={() => navigate('/my-courses')}
              className="btn-ghost gap-1 text-sm"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {enrollments.slice(0, 3).map((enrollment) => (
              <CourseCard
                key={enrollment._id}
                course={enrollment.course as Course}
                isEnrolled={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'primary' | 'accent' | 'amber' | 'rose';
}> = ({ icon, label, value, color }) => {
  const colorMap = {
    primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    accent: 'bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
