import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Clock,
  Plus,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { quizService } from '../services/quizService';
import { Course, QuizResult } from '../types';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const { user, enrollments } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0 });
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  const canManageCourses = user?.role === 'teacher' || user?.role === 'admin';

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      if (canManageCourses) {
        const response = await courseService.getAll({ teacher: user._id, limit: 50 });
        setCourses(response.courses);
        setStats({
          totalCourses: response.courses.length,
          totalStudents: response.courses.reduce(
            (sum, course) => sum + (course.enrollmentCount || 0),
            0
          ),
        });
        setQuizResults([]);
      } else {
        const response = await courseService.getAll({ limit: 4 });
        setCourses(response.courses);

        try {
          const results = await quizService.getMyResults();
          setQuizResults(results);
        } catch (error) {
          console.error('Failed to load quiz results for dashboard:', error);
          setQuizResults([]);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [canManageCourses, user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const passedQuizzes = quizResults.filter(
    (result) => Math.round((result.score / result.totalQuestions) * 100) >= 60
  ).length;

  const averageScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce(
            (sum, result) => sum + (result.score / result.totalQuestions) * 100,
            0
          ) / quizResults.length
        )
      : 0;

  const buildHeatmapData = () => {
    const activityDays = new Set<string>();

    enrollments.forEach((enrollment) => {
      if (enrollment.enrolledAt) {
        activityDays.add(new Date(enrollment.enrolledAt).toDateString());
      }
    });

    quizResults.forEach((result) => {
      if (result.submittedAt) {
        activityDays.add(new Date(result.submittedAt).toDateString());
      }
    });

    return Array.from({ length: 42 }).map((_, index) => {
      const date = new Date(Date.now() - (41 - index) * 24 * 60 * 60 * 1000);
      return {
        date,
        level: activityDays.has(date.toDateString()) ? 3 : 0,
      };
    });
  };

  const heatmapData = buildHeatmapData();
  const activeDaysCount = heatmapData.filter((item) => item.level > 0).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-wider text-primary-400">
            Dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
          <p className="mt-2 text-primary-400">
            {canManageCourses
              ? `Monitor course activity, enrollment counts, and performance at a glance.`
              : `Track your enrolled courses, quiz history, and learning activity.`}
          </p>
        </div>

        {canManageCourses && (
          <button
            onClick={() => navigate('/create-course')}
            className="btn-primary h-10 gap-2 px-4 text-sm"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <div className="widget-panel relative col-span-1 bg-grid p-6 md:col-span-4 lg:col-span-4">
          <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-transparent to-[#111111] opacity-60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-80 pointer-events-none" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="mb-12">
              <h2 className="mb-2 text-2xl font-bold text-white">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},{' '}
                {user?.name?.split(' ')[0]}
              </h2>
              <p className="text-primary-400">
                {canManageCourses
                  ? `You are managing ${stats.totalCourses} course${stats.totalCourses !== 1 ? 's' : ''} with ${stats.totalStudents} total enrollment${stats.totalStudents !== 1 ? 's' : ''}.`
                  : `You have ${enrollments.length} active course${enrollments.length !== 1 ? 's' : ''} and ${quizResults.length} recorded quiz attempt${quizResults.length !== 1 ? 's' : ''}.`}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-3xl font-bold tracking-tight text-white">
                  {canManageCourses ? stats.totalStudents : enrollments.length}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                  {canManageCourses ? 'Total Enrollments' : 'Active Courses'}
                </span>
              </div>
              <div className="h-10 w-px bg-[#27272a]" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold tracking-tight text-white">
                  {canManageCourses ? stats.totalCourses : quizResults.length}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                  {canManageCourses ? 'Courses Managed' : 'Quizzes Taken'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="widget-panel col-span-1 flex flex-col p-5 md:col-span-2 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-200">
              <Activity className="h-4 w-4 text-green-500" />
              Activity
            </h3>
            <span className="text-xs font-medium text-primary-500">Last 6 Weeks</span>
          </div>
          <div className="flex flex-1 flex-col justify-end">
            <div className="grid auto-rows-max grid-cols-7 gap-1.5">
              {heatmapData.map((item, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-sm ${
                    item.level === 0 ? 'bg-[#27272a]' : 'bg-green-500/80'
                  }`}
                  title={formatDate(item.date.toDateString())}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-medium text-primary-500">
              <span>
                {activeDaysCount} active day{activeDaysCount !== 1 ? 's' : ''}
              </span>
              <span>Inactive / Active</span>
            </div>
          </div>
        </div>

        <div className="widget-panel col-span-1 p-5 md:col-span-2 lg:col-span-2">
          <div className="mb-2 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="text-sm font-semibold text-primary-200">Passed Quizzes</h3>
          </div>
          <p className="mb-1 text-2xl font-bold text-white">{passedQuizzes}</p>
          <p className="text-xs text-primary-500">Score of 60% or higher</p>
        </div>

        <div className="widget-panel col-span-1 p-5 md:col-span-2 lg:col-span-2">
          <div className="mb-2 flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-semibold text-primary-200">Quiz Attempts</h3>
          </div>
          <p className="mb-1 text-2xl font-bold text-white">{quizResults.length}</p>
          <p className="text-xs text-primary-500">Completed assessments</p>
        </div>

        <div className="widget-panel col-span-1 p-5 md:col-span-2 lg:col-span-2">
          <div className="mb-2 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <h3 className="text-sm font-semibold text-primary-200">Average Score</h3>
          </div>
          <p className="mb-1 text-2xl font-bold text-white">
            {quizResults.length > 0 ? `${averageScore}%` : '—'}
          </p>
          <p className="text-xs text-primary-500">
            {quizResults.length > 0
              ? `Across ${quizResults.length} attempt${quizResults.length !== 1 ? 's' : ''}`
              : 'No quiz data yet'}
          </p>
        </div>

        <div className="col-span-1 mt-4 md:col-span-4 lg:col-span-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="title-md">
              {canManageCourses ? 'Recently Managed Courses' : 'Continue Learning'}
            </h2>
            <button
              onClick={() => navigate(canManageCourses ? '/courses' : '/my-courses')}
              className="flex items-center gap-1 text-sm font-medium text-primary-400 transition-colors hover:text-white"
            >
              View All <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {courses.length === 0 && enrollments.length === 0 ? (
            <div className="widget-panel flex flex-col items-center justify-center p-12 text-center">
              <BookOpen className="mb-4 h-12 w-12 text-[#27272a]" />
              <h3 className="mb-2 text-lg font-semibold text-white">
                {canManageCourses ? 'No courses created yet' : 'No active courses'}
              </h3>
              <p className="mb-6 max-w-sm text-primary-500">
                {canManageCourses
                  ? 'Create your first course to start publishing materials and assessments.'
                  : 'Browse the catalog to enroll in a course and begin learning.'}
              </p>
              <button
                onClick={() => navigate(canManageCourses ? '/create-course' : '/courses')}
                className="btn-primary"
              >
                {canManageCourses ? 'Create Course' : 'Browse Courses'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {canManageCourses
                ? courses.slice(0, 4).map((course) => (
                    <CourseCard key={course._id} course={course} isEnrolled={false} />
                  ))
                : enrollments.slice(0, 4).map((enrollment) => (
                    <CourseCard
                      key={enrollment._id}
                      course={enrollment.course as Course}
                      isEnrolled
                    />
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
