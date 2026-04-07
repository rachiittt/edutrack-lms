import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { BookOpen, GraduationCap } from 'lucide-react';

const MyCourses: React.FC = () => {
  const { user, enrollments } = useAuth();
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    try {
      if (user?.role === 'teacher') {
        const response = await courseService.getAll({ teacher: user._id, limit: 50 } as any);
        setTeacherCourses(response.data.courses);
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
          {isStudent ? 'My Enrolled Courses' : 'My Created Courses'}
        </h1>
        <p className="text-surface-500 dark:text-surface-400">
          {isStudent
            ? `You are enrolled in ${courses.length} course(s)`
            : `You have created ${courses.length} course(s)`}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          {isStudent ? (
            <GraduationCap className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
          ) : (
            <BookOpen className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
          )}
          <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2">
            No courses yet
          </h3>
          <p className="text-surface-500 dark:text-surface-400">
            {isStudent
              ? 'Browse courses and enroll to start learning!'
              : 'Create your first course to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} isEnrolled={isStudent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
