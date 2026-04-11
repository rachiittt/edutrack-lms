import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { quizService } from '../services/quizService';
import { Course, QuizResult } from '../types';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BookOpen,
  Users,
  Trophy,
  ArrowRight,
  TrendingUp,
  Clock,
  Activity,
  Plus
} from 'lucide-react';
import { formatDate } from '../utils/formatters';
const Dashboard: React.FC = () => {
  const { user, enrollments } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0 });
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  useEffect(() => {
    loadData();
  }, [user]);
  const loadData = async () => {
    try {
      if (user?.role === 'teacher') {
        const response = await courseService.getAll({ teacher: user._id, limit: 50 });
        const courses = response.data?.courses || [];
        setCourses(courses);
        const totalStudents = courses.reduce(
          (sum: number, c: Course) => sum + (c.enrollmentCount || 0),
          0
        );
        setStats({ totalCourses: courses.length, totalStudents });
      } else {
        const response = await courseService.getAll({ limit: 4 });
        const courses = response.data?.courses || [];
        setCourses(courses);
        try {
          const resultsRes = await quizService.getMyResults();
          setQuizResults(resultsRes.data.results || []);
        } catch (error) {
          console.error('Failed to load quiz results for dashboard:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  const passedQuizzes = quizResults.filter(
    (r) => Math.round((r.score / r.totalQuestions) * 100) >= 60
  ).length;
  const averageScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce(
            (sum, r) => sum + (r.score / r.totalQuestions) * 100,
            0
          ) / quizResults.length
        )
      : 0;
  const buildHeatmapData = () => {
    const activityDays = new Set<string>();
    enrollments.forEach((e) => {
      if (e.enrolledAt) {
        activityDays.add(new Date(e.enrolledAt).toDateString());
      }
    });
    quizResults.forEach((r) => {
      if (r.submittedAt) {
        activityDays.add(new Date(r.submittedAt).toDateString());
      }
    });
    return Array.from({ length: 42 }).map((_, i) => {
      const date = new Date(Date.now() - (41 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toDateString();
      const hasActivity = activityDays.has(dateStr);
      return {
        date,
        level: hasActivity ? 3 : 0,
      };
    });
  };
  const heatmapData = buildHeatmapData();
  const activeDaysCount = heatmapData.filter((d) => d.level > 0).length;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-primary-400 text-sm font-medium uppercase tracking-wider mb-1">
            Command Center
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Overview
          </h1>
        </div>
        {user?.role === 'teacher' && (
          <button
            onClick={() => navigate('/create-course')}
            className="btn-primary gap-2 h-10 px-4 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Studio Project
          </button>
        )}
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {}
        <div className="widget-panel col-span-1 md:col-span-4 lg:col-span-4 p-6 relative bg-grid">
          <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-transparent to-[#111111] opacity-60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-80 pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-2">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}
              </h2>
              <p className="text-primary-400">
                {user?.role === 'teacher'
                  ? `You have ${stats.totalStudents} total student${stats.totalStudents !== 1 ? 's' : ''} across ${stats.totalCourses} course${stats.totalCourses !== 1 ? 's' : ''}.`
                  : `You have ${enrollments.length} active enrollment${enrollments.length !== 1 ? 's' : ''}${quizResults.length > 0 ? ` and completed ${quizResults.length} quiz${quizResults.length !== 1 ? 'zes' : ''}.` : '.'}`}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white tracking-tight">
                  {user?.role === 'teacher' ? stats.totalStudents : enrollments.length}
                </span>
                <span className="text-xs text-primary-500 uppercase tracking-wider font-semibold">
                  {user?.role === 'teacher' ? 'Total Students' : 'Active Courses'}
                </span>
              </div>
              <div className="w-[1px] h-10 bg-[#27272a]"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-1">
                  {user?.role === 'teacher' ? stats.totalCourses : quizResults.length}
                </span>
                <span className="text-xs text-primary-500 uppercase tracking-wider font-semibold">
                  {user?.role === 'teacher' ? 'Active Courses' : 'Quizzes Taken'}
                </span>
              </div>
            </div>
          </div>
        </div>
        {}
        <div className="widget-panel col-span-1 md:col-span-2 lg:col-span-2 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-primary-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              Activity Profile
            </h3>
            <span className="text-xs font-medium text-primary-500">Last 6 Weeks</span>
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="grid grid-cols-7 gap-1.5 auto-rows-max">
              {heatmapData.map((d, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${
                    d.level === 0 ? 'bg-[#27272a]' :
                    d.level === 1 ? 'bg-green-900/40' :
                    d.level === 2 ? 'bg-green-700/60' :
                    d.level === 3 ? 'bg-green-500/80' :
                    'bg-green-400'
                  }`}
                  title={`${formatDate(d.date.toDateString())}`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-primary-500 font-medium">
              <span>{activeDaysCount} active day{activeDaysCount !== 1 ? 's' : ''}</span>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#27272a]" />
                <div className="w-3 h-3 rounded-sm bg-green-500/80" />
              </div>
              <span>Inactive / Active</span>
            </div>
          </div>
        </div>
        {}
        <div className="widget-panel col-span-1 md:col-span-2 lg:col-span-2 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-sm font-semibold text-primary-200">Achievements</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{passedQuizzes}</p>
          <p className="text-xs text-primary-500">Quiz{passedQuizzes !== 1 ? 'zes' : ''} passed (≥60%)</p>
        </div>
        <div className="widget-panel col-span-1 md:col-span-2 lg:col-span-2 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-semibold text-primary-200">Quizzes Taken</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{quizResults.length}</p>
          <p className="text-xs text-primary-500">Total assessments completed</p>
        </div>
        <div className="widget-panel col-span-1 md:col-span-2 lg:col-span-2 p-5">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-semibold text-primary-200">Avg Score</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{averageScore > 0 ? `${averageScore}%` : '—'}</p>
          <p className="text-xs text-primary-500">
            {quizResults.length > 0
              ? `Across ${quizResults.length} quiz${quizResults.length !== 1 ? 'zes' : ''}`
              : 'No quizzes taken yet'}
          </p>
        </div>
        {}
        <div className="col-span-1 md:col-span-4 lg:col-span-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="title-md">
              {user?.role === 'teacher' ? 'Active Projects' : 'Continue Learning'}
            </h2>
            <button
              onClick={() => navigate(user?.role === 'teacher' ? '/courses' : '/my-courses')}
              className="text-primary-400 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {courses.length === 0 && enrollments.length === 0 ? (
            <div className="widget-panel p-12 text-center flex flex-col items-center justify-center">
              <BookOpen className="w-12 h-12 text-[#27272a] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {user?.role === 'teacher' ? 'No active studio projects' : 'No active courses'}
              </h3>
              <p className="text-primary-500 max-w-sm mb-6">
                {user?.role === 'teacher'
                  ? 'Start building your next masterpiece in the studio.'
                  : 'Explore the catalog to start your next learning journey.'}
              </p>
              <button
                onClick={() => navigate(user?.role === 'teacher' ? '/create-course' : '/courses')}
                className="btn-primary"
              >
                {user?.role === 'teacher' ? 'Go to Studio' : 'Browse Courses'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {user?.role === 'teacher'
                ? courses.slice(0, 4).map((course) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      isEnrolled={false}
                    />
                  ))
                : enrollments.slice(0, 4).map((enrollment) => (
                    <CourseCard
                      key={enrollment._id}
                      course={enrollment.course as Course}
                      isEnrolled={true}
                    />
                  ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
