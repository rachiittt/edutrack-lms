import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services/quizService';
import { QuizResult } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Trophy, CheckCircle2, XCircle } from 'lucide-react';

const MyResults: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [user]);

  const loadResults = async () => {
    try {
      const response = await quizService.getMyResults();
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
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
          My Quiz Results
        </h1>
        <p className="text-surface-500 dark:text-surface-400">
          Track your quiz performance here
        </p>
      </div>

      {results.length === 0 ? (
        <div className="card p-12 text-center">
          <Trophy className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2">
            No quiz results yet
          </h3>
          <p className="text-surface-500 dark:text-surface-400">
            Complete a quiz to see your results here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result) => {
            const percentage = Math.round(
              (result.score / result.totalQuestions) * 100
            );
            const passed = percentage >= 60;

            return (
              <div key={result._id} className="card p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  passed
                    ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-500'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-500'
                }`}>
                  {passed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-surface-900 dark:text-white">
                    {typeof result.quiz === 'object' ? result.quiz.title : 'Quiz'}
                  </p>
                  <p className="text-sm text-surface-500">
                    {typeof result.course === 'object' ? result.course.title : ''} •{' '}
                    {new Date(result.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${passed ? 'text-accent-500' : 'text-red-500'}`}>
                    {percentage}%
                  </p>
                  <p className="text-xs text-surface-400">
                    {result.score}/{result.totalQuestions} correct
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

export default MyResults;
