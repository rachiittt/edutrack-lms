import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import type { Quiz } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  useEffect(() => {
    if (!quiz || result) return;
    setTimeLeft(quiz.duration * 60);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, result]);

  const loadQuiz = async () => {
    if (!id) return;
    try {
      // Check if already attempted
      const resultsRes = await quizService.getResults(id);
      if (resultsRes.data.results.length > 0) {
        setResult(resultsRes.data.results[0]);
      }
    } catch { /* ignore - might not have results */ }

    try {
      // Fetch the quiz directly
      const quizRes = await quizService.getById(id);
      const fetchedQuiz = quizRes.data.quiz;
      setQuiz(fetchedQuiz);
      setAnswers(new Array(fetchedQuiz.questions.length).fill(-1));
    } catch (error) {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!id || !quiz) return;
    
    // Fill unanswered with 0
    const finalAnswers = answers.map((a) => (a === -1 ? 0 : a));

    setSubmitting(true);
    try {
      const response = await quizService.attempt(id, finalAnswers);
      setResult(response.data.result);
      toast.success('Quiz submitted!');
    } catch (error: any) {
      if (error.response?.data?.message?.includes('already attempted')) {
        toast.error('You have already attempted this quiz');
        navigate(-1);
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit quiz');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-surface-700 dark:text-surface-300">Quiz not found</h2>
        <button onClick={() => navigate(-1)} className="btn-primary mt-4">Go Back</button>
      </div>
    );
  }

  // Result View
  if (result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    const passed = percentage >= 60;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <button onClick={() => navigate(-1)} className="btn-ghost gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </button>

        <div className="card p-8 text-center">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
            passed
              ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-500'
              : 'bg-red-50 dark:bg-red-900/30 text-red-500'
          }`}>
            {passed ? (
              <CheckCircle2 className="w-12 h-12" />
            ) : (
              <AlertCircle className="w-12 h-12" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
            {passed ? 'Congratulations!' : 'Keep Trying!'}
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">{quiz.title}</p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div>
              <p className={`text-5xl font-bold ${passed ? 'text-accent-500' : 'text-red-500'}`}>
                {percentage}%
              </p>
              <p className="text-sm text-surface-500 mt-1">Score</p>
            </div>
            <div className="w-px h-16 bg-surface-200 dark:bg-surface-700" />
            <div>
              <p className="text-3xl font-bold text-surface-900 dark:text-white">
                {result.score}/{result.totalQuestions}
              </p>
              <p className="text-sm text-surface-500 mt-1">Correct</p>
            </div>
          </div>

          {/* Answer Review */}
          <div className="text-left space-y-4 mt-8 pt-8 border-t border-surface-200 dark:border-surface-700">
            <h3 className="font-bold text-lg text-surface-900 dark:text-white">Answer Review</h3>
            {quiz.questions.map((q, idx) => {
              const isCorrect = result.answers[idx] === q.correctAnswer;
              return (
                <div key={idx} className={`p-4 rounded-xl border-2 ${
                  isCorrect
                    ? 'border-accent-200 dark:border-accent-800 bg-accent-50/50 dark:bg-accent-900/20'
                    : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20'
                }`}>
                  <p className="font-medium text-surface-900 dark:text-white mb-2">
                    {idx + 1}. {q.questionText}
                  </p>
                  <p className="text-sm">
                    <span className="text-surface-500">Your answer: </span>
                    <span className={isCorrect ? 'text-accent-600 font-medium' : 'text-red-600 font-medium'}>
                      {q.options[result.answers[idx]] || 'Not answered'}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-sm mt-1">
                      <span className="text-surface-500">Correct: </span>
                      <span className="text-accent-600 font-medium">{q.options[q.correctAnswer]}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Quiz Taking View
  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const allAnswered = answers.every((a) => a !== -1);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-900 dark:text-white">{quiz.title}</h1>
          <p className="text-sm text-surface-500">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${
          timeLeft < 60
            ? 'bg-red-50 dark:bg-red-900/30 text-red-600 animate-pulse'
            : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300'
        }`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="card p-8">
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">
          {question.questionText}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                answers[currentQuestion] === idx
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 text-surface-700 dark:text-surface-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  answers[currentQuestion] === idx
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="btn-secondary disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {quiz.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                idx === currentQuestion
                  ? 'bg-primary-600 text-white'
                  : answers[idx] !== -1
                  ? 'bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-300'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || !allAnswered}
            className="btn-accent disabled:opacity-50 gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Submit
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="btn-primary"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
