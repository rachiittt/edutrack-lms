import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isEnrolled }) => {
  const navigate = useNavigate();

  const categoryColors: Record<string, string> = {
    'Web Development': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'Computer Science': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    'Artificial Intelligence': 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    'Cybersecurity': 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    default: 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300',
  };

  return (
    <div
      onClick={() => navigate(`/courses/${course._id}`)}
      className="card overflow-hidden cursor-pointer group hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={course.thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400`}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {isEnrolled && (
          <div className="absolute top-3 right-3 badge bg-accent-500 text-white shadow-lg">
            Enrolled
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className={`badge ${categoryColors[course.category] || categoryColors.default}`}>
            {course.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-4">
          {course.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-100 dark:border-surface-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
              {course.teacher?.name?.charAt(0) || 'T'}
            </div>
            <span className="text-xs font-medium text-surface-500 dark:text-surface-400 truncate max-w-[120px]">
              {course.teacher?.name || 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-surface-400">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{course.enrollmentCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Course</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
