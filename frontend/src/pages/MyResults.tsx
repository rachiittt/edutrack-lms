import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services/quizService';
import { QuizResult } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Trophy, CheckCircle2, XCircle, Award } from 'lucide-react';

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

  // Calculate stats
  const totalQuizzes = results.length;
  const averageScore = totalQuizzes > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) / totalQuizzes)
    : 0;
  const passedCount = results.filter(r => Math.round((r.score / r.totalQuestions) * 100) >= 60).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Award className="w-8 h-8 text-yellow-500" />
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Achievements
        </h1>
      </div>
      <p className="text-primary-400 text-lg max-w-2xl">
        Track your quiz performance and learning progress across all courses.
      </p>

      {/* Stats Row */}
      {totalQuizzes > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="widget-panel p-5">
            <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-1">Quizzes Taken</div>
            <div className="text-3xl font-bold text-white">{totalQuizzes}</div>
          </div>
          <div className="widget-panel p-5">
            <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-1">Average Score</div>
            <div className="text-3xl font-bold text-white">{averageScore}%</div>
          </div>
          <div className="widget-panel p-5">
            <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-1">Pass Rate</div>
            <div className="text-3xl font-bold text-white">{totalQuizzes > 0 ? Math.round((passedCount / totalQuizzes) * 100) : 0}%</div>
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <div className="widget-panel p-16 text-center flex flex-col items-center justify-center">
          <Trophy className="w-12 h-12 text-[#27272a] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No quiz results yet
          </h3>
          <p className="text-primary-500 max-w-sm mb-6">
            Complete a quiz to see your results and track your learning progress here.
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="btn-primary"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-4">
            All Results
          </div>
          {results.map((result) => {
            const percentage = Math.round(
              (result.score / result.totalQuestions) * 100
            );
            const passed = percentage >= 60;

            return (
              <div key={result._id} className="widget-panel p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  passed
                    ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                    : 'bg-red-500/10 border border-red-500/20 text-red-500'
                }`}>
                  {passed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {typeof result.quiz === 'object' ? result.quiz.title : 'Quiz'}
                  </p>
                  <p className="text-sm text-primary-500 truncate">
                    {typeof result.course === 'object' ? result.course.title : ''} •{' '}
                    {new Date(result.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-2xl font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>
                    {percentage}%
                  </p>
                  <p className="text-xs text-primary-500">
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
