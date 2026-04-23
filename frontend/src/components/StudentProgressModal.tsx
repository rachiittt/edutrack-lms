import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface StudentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: { name: string; email: string } | null;
  courseId: string;
  studentId: string;
}

interface ProgressItem {
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  score: number | null;
  percentage: number | null;
  attempted: boolean;
  submittedAt: string | null;
}

interface ProgressData {
  progress: ProgressItem[];
  summary: {
    totalQuizzes: number;
    attempted: number;
    averageScore: number;
  };
}

import api from '../services/api';
import { formatDate } from '../utils/formatters';

const StudentProgressModal: React.FC<StudentProgressModalProps> = ({
  isOpen,
  onClose,
  student,
  courseId,
  studentId,
}) => {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isOpen || !courseId || !studentId) return;
    setLoading(true);
    api
      .get(`/enrollments/courses/${courseId}/students/${studentId}/progress`)
      .then((res) => setData(res.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [isOpen, courseId, studentId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-[#27272a] bg-[#111111] shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between border-b border-[#27272a] px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {student?.name || 'Student'}'s Progress
            </h3>
            <p className="text-xs text-primary-500">{student?.email}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-primary-500 transition-colors hover:bg-[#27272a] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : !data ? (
            <p className="py-8 text-center text-primary-500">Failed to load progress.</p>
          ) : (
            <>
              {/* Summary cards */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-3 text-center">
                  <p className="text-xl font-bold text-white">{data.summary.totalQuizzes}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-500">
                    Total
                  </p>
                </div>
                <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-3 text-center">
                  <p className="text-xl font-bold text-white">{data.summary.attempted}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-500">
                    Attempted
                  </p>
                </div>
                <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-3 text-center">
                  <p className="text-xl font-bold text-white">
                    {data.summary.attempted > 0 ? `${data.summary.averageScore}%` : '—'}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-500">
                    Avg Score
                  </p>
                </div>
              </div>

              {/* Quiz list */}
              <div className="space-y-3">
                {data.progress.length === 0 && (
                  <p className="py-4 text-center text-sm text-primary-500">
                    No quizzes in this course yet.
                  </p>
                )}
                {data.progress.map((item) => (
                  <div
                    key={item.quizId}
                    className="rounded-xl border border-[#27272a] bg-[#09090b] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{item.quizTitle}</p>
                      {item.attempted ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            (item.percentage || 0) >= 60
                              ? 'bg-green-500/15 text-green-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {item.percentage}%
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#27272a] px-2.5 py-1 text-xs font-semibold text-primary-500">
                          Not attempted
                        </span>
                      )}
                    </div>
                    {item.attempted && (
                      <div className="mt-2 flex items-center gap-4 text-xs text-primary-500">
                        <span>
                          Score: {item.score}/{item.totalQuestions}
                        </span>
                        {item.submittedAt && <span>{formatDate(item.submittedAt)}</span>}
                      </div>
                    )}
                    {/* Progress bar */}
                    {item.attempted && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#27272a]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            (item.percentage || 0) >= 60 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.percentage || 0}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProgressModal;
