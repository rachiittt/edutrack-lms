import React, { useEffect, useState, useCallback } from 'react';
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

  const loadResults = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const nextResults = await quizService.getResults(id);
      setResults(nextResults);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) / results.length)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      <button onClick={() => navigate(-1)} className="flex items-center text-xs font-semibold text-primary-500 hover:text-white uppercase tracking-wider transition-colors gap-2">
        <ArrowLeft className="w-3 h-3" />
        Back
      </button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Assessment Analytics</h1>
          <p className="text-primary-500 mt-1">{results.length} submissions</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
          <Trophy className="w-6 h-6" />
        </div>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="widget-panel p-5">
            <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-1">Total Students</div>
            <div className="text-3xl font-bold text-white">{results.length}</div>
          </div>
          <div className="widget-panel p-5">
            <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-1">Average Score</div>
            <div className="text-3xl font-bold text-white">{avgScore}%</div>
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <div className="widget-panel p-16 text-center flex flex-col items-center justify-center">
          <Users className="w-12 h-12 text-[#27272a] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No results yet
          </h3>
          <p className="text-primary-500">No students have attempted this quiz yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-4">
            Leaderboard
          </div>
          {results.map((result, idx) => {
            const percentage = Math.round(
              (result.score / result.totalQuestions) * 100
            );
            const passed = percentage >= 60;
            return (
              <div key={result._id} className="widget-panel p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                  idx === 0
                    ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500'
                    : idx === 1
                    ? 'bg-primary-400/10 border border-primary-400/30 text-primary-300'
                    : idx === 2
                    ? 'bg-orange-500/10 border border-orange-500/30 text-orange-500'
                    : 'bg-[#1d1d20] border border-[#27272a] text-primary-500'
                }`}>
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {result.student && typeof result.student === 'object'
                      ? result.student.name
                      : 'Student'}
                  </p>
                  <p className="text-xs text-primary-500 truncate">
                    {result.student && typeof result.student === 'object' ? result.student.email : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-lg font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>
                    {percentage}%
                  </p>
                  <p className="text-xs text-primary-500">
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
