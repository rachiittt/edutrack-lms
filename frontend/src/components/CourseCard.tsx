import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LayoutList } from 'lucide-react';
import { Course } from '../types';
import { useAuth } from '../context/AuthContext';
import { resolveApiUrl } from '../utils/urlResolver';
import api from '../services/api';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isEnrolled }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState<{ percentage: number; attempted: number; totalQuizzes: number } | null>(null);

  useEffect(() => {
    if (isEnrolled && user?.role === 'student') {
      api
        .get(`/enrollments/courses/${course._id}/students/${user._id}/progress`)
        .then((res) => {
          const { summary } = res.data.data;
          setProgress({
            percentage: summary.averageScore,
            attempted: summary.attempted,
            totalQuizzes: summary.totalQuizzes,
          });
        })
        .catch(() => {
          // ignore error
        });
    }
  }, [isEnrolled, course._id, user]);

  return (
    <div
      onClick={() => {
        if (course?._id) {
          navigate(`/courses/${course._id}`);
        }
      }}
      className="widget-panel group flex h-full w-full cursor-pointer flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 active:scale-[0.98]"
    >
      <div className="relative h-40 overflow-hidden border-b border-[#27272a] bg-[#1d1d20]">
        {course.thumbnail ? (
          <img
            src={resolveApiUrl(course.thumbnail)}
            alt={course.title}
            className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#27272a] to-[#111111] text-[#3f3f46]">
            <LayoutList className="h-8 w-8" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-2">
          {isEnrolled && (
            <div className="tag border-green-500/30 bg-green-500/20 text-green-400 backdrop-blur-md">
              Enrolled
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="tag">
            {course.category}
          </span>
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight text-white transition-colors group-hover:text-blue-400">
          {course.title}
        </h3>

        <p className="mb-6 flex-1 line-clamp-3 text-[13px] leading-relaxed text-primary-500 font-medium">
          {course.description}
        </p>

        {isEnrolled && progress && progress.totalQuizzes > 0 && (
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-primary-400">
              <span>Progress ({progress.attempted}/{progress.totalQuizzes} quizzes)</span>
              <span>{progress.percentage}% avg score</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#27272a]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress.percentage >= 60 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress.percentage || 0}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-[#27272a] pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-xs font-semibold text-primary-300">
              {course.teacher?.name?.charAt(0) || 'T'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wider text-primary-500">
                Instructor
              </p>
              <p className="truncate text-sm text-primary-300">
                {course.teacher?.name || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="tag">
            <Users className="h-3.5 w-3.5" />
            <span>{course.enrollmentCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
