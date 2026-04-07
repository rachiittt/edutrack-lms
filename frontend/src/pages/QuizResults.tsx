import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { QuizResult } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Trophy, Users } from 'lucide-react';

const QuizResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [id]);

  const loadResults = async () => {
    if (!id) return;
    try {
      const response = await quizService.getResults(id);
      setResults(response.data.results);
    } catch (error) {
      console.error('Failed to load results:', error);
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost gap-2 -ml-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Quiz Results</h1>
          <p className="text-surface-500">{results.length} submissions</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
          <Trophy className="w-6 h-6" />
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300">
            No results yet
          </h3>
          <p className="text-surface-500">No students have attempted this quiz</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result, idx) => {
            const percentage = Math.round(
              (result.score / result.totalQuestions) * 100
            );
            const passed = percentage >= 60;

            return (
              <div key={result._id} className="card p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  idx === 0
                    ? 'bg-amber-100 text-amber-700'
                    : idx === 1
                    ? 'bg-surface-200 text-surface-700'
                    : idx === 2
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-surface-100 text-surface-500'
                }`}>
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-surface-900 dark:text-white">
                    {typeof result.student === 'object'
                      ? result.student.name
                      : 'Student'}
                  </p>
                  <p className="text-xs text-surface-400">
                    {typeof result.student === 'object' ? result.student.email : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${passed ? 'text-accent-500' : 'text-red-500'}`}>
                    {percentage}%
                  </p>
                  <p className="text-xs text-surface-400">
                    {result.score}/{result.totalQuestions}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizResults;
