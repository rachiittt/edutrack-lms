import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

const MyCourses: React.FC = () => {
  const { user, enrollments } = useAuth();
  const navigate = useNavigate();
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadCourses();
  }, [user]);
  const loadCourses = async () => {
    try {
      if (user?.role === 'teacher') {
        const response = await courseService.getAll({ teacher: user._id, limit: 50 });
        setTeacherCourses(response.data?.courses || []);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  const isStudent = user?.role === 'student';
  const courses = isStudent
    ? enrollments.map((e) => e.course as Course).filter(Boolean)
    : teacherCourses;
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              {isStudent ? 'My Learning' : 'My Projects'}
            </h1>
          </div>
          <p className="text-primary-400 text-lg">
            {isStudent
              ? `You are enrolled in ${courses.length} course(s). Keep up the momentum.`
              : `You have created ${courses.length} course(s). Manage your studio projects here.`}
          </p>
        </div>
        {!isStudent && (
          <button
            onClick={() => navigate('/create-course')}
            className="btn-primary gap-2 h-10 px-4 text-sm shrink-0"
          >
            New Project <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
      {courses.length === 0 ? (
        <div className="widget-panel p-16 text-center flex flex-col items-center justify-center">
          {isStudent ? (
            <GraduationCap className="w-12 h-12 text-[#27272a] mb-4" />
          ) : (
            <BookOpen className="w-12 h-12 text-[#27272a] mb-4" />
          )}
          <h3 className="text-lg font-semibold text-white mb-2">
            No courses yet
          </h3>
          <p className="text-primary-500 max-w-sm mb-6">
            {isStudent
              ? 'Browse the catalog and enroll to start your learning journey.'
              : 'Create your first project in the studio to get started.'}
          </p>
          <button
            onClick={() => navigate(isStudent ? '/courses' : '/create-course')}
            className="btn-primary"
          >
            {isStudent ? 'Browse Courses' : 'Go to Studio'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} isEnrolled={isStudent} />
          ))}
        </div>
      )}
    </div>
  );
};
export default MyCourses;
