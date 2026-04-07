import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import type { Quiz } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import classNames from 'classnames';

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
      const resultsRes = await quizService.getResults(id);
      if (resultsRes.data.results.length > 0) {
        setResult(resultsRes.data.results[0]);
      }
    } catch { /* ignore */ }

    try {
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
    const finalAnswers = answers.map((a) => (a === -1 ? 0 : a));

    setSubmitting(true);
    try {
      const response = await quizService.attempt(id, finalAnswers);
      setResult(response.data.result);
      toast.success('Assessment submitted!');
    } catch (error: any) {
      if (error.response?.data?.message?.includes('already attempted')) {
        toast.error('You have already taken this assessment');
        navigate(-1);
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit');
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

  if (loading) return <div className="flex justify-center items-center h-screen bg-[#09090b]"><LoadingSpinner size="lg" /></div>;
  if (!quiz) return <div className="text-center py-20 text-white">Assessment not found</div>;

  // -- RESULTS VIEW --
  if (result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <button onClick={() => navigate(-1)} className="text-primary-500 hover:text-white flex items-center gap-2 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Project
          </button>
          
          <div className="bg-[#111111] border border-[#27272a] rounded-2xl p-10 text-center relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-full h-1 ${passed ? 'bg-green-500' : 'bg-red-500'}`} />
             
             <div className="flex justify-center mb-6">
               {passed ? <CheckCircle2 className="w-16 h-16 text-green-500" /> : <AlertCircle className="w-16 h-16 text-red-500" />}
             </div>
             
             <h1 className="text-3xl font-bold tracking-tight mb-2">{passed ? 'Assessment Passed' : 'Assessment Failed'}</h1>
             <p className="text-primary-400 mb-8">{quiz.title}</p>
             
             <div className="flex justify-center gap-12 mb-10">
               <div>
                 <div className="text-5xl font-black mb-1">{percentage}%</div>
                 <div className="text-xs uppercase tracking-wider text-primary-500 font-bold">Score</div>
               </div>
               <div className="w-px h-16 bg-[#27272a]" />
               <div>
                 <div className="text-5xl font-black mb-1">{result.score}/{result.totalQuestions}</div>
                 <div className="text-xs uppercase tracking-wider text-primary-500 font-bold">Points</div>
               </div>
             </div>

             <div className="text-left">
               <h3 className="uppercase text-xs font-bold tracking-wider text-primary-500 mb-4 px-2">Review</h3>
               <div className="space-y-3">
                 {quiz.questions.map((q, idx) => {
                   const isCorrect = result.answers[idx] === q.correctAnswer;
                   return (
                     <div key={idx} className={classNames("p-4 rounded-lg flex items-start gap-4", {
                       "bg-green-500/10 border border-green-500/20": isCorrect,
                       "bg-red-500/10 border border-red-500/20": !isCorrect
                     })}>
                       <span className={classNames("font-bold", { "text-green-500": isCorrect, "text-red-500": !isCorrect })}>{idx + 1}.</span>
                       <div>
                         <p className="text-white font-medium mb-1">{q.questionText}</p>
                         <div className="text-sm">
                           <span className="text-primary-400 mr-2">Your answer:</span>
                           <span className={isCorrect ? "text-green-400" : "text-red-400 line-through"}>{q.options[result.answers[idx]] || 'None'}</span>
                         </div>
                         {!isCorrect && (
                           <div className="text-sm mt-1">
                             <span className="text-primary-400 mr-2">Correct:</span>
                             <span className="text-green-400">{q.options[q.correctAnswer]}</span>
                           </div>
                         )}
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // -- ACTIVE QUIZ FOCUS UI --
  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const allAnswered = answers.every((a) => a !== -1);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-between">
      
      {/* Top minimal progress bar */}
      <div className="h-1.5 w-full bg-[#1d1d20]">
        <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <header className="px-8 py-6 flex justify-between items-center border-b border-[#27272a]/50">
        <div className="text-primary-400 text-sm font-semibold tracking-wider uppercase">
          {quiz.title} <span className="mx-2 text-[#27272a]">|</span> <span className="text-white">Q {currentQuestion + 1} / {quiz.questions.length}</span>
        </div>
        <div className={classNames("text-lg font-mono font-bold px-3 py-1 bg-[#1d1d20] border border-[#27272a] rounded", {
          "text-red-500 bg-red-500/10 border-red-500/20 animate-pulse": timeLeft < 60,
          "text-white": timeLeft >= 60
        })}>
          {formatTime(timeLeft)}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full relative">
        <div className="w-full animate-fade-in">
          <h2 className="text-3xl md:text-5xl lg:text-5xl font-black tracking-tight text-white mb-16 leading-tight">
             {question.questionText}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                className={classNames("text-left p-6 rounded-xl border-2 transition-all duration-200 text-lg font-medium outline-none", {
                  "border-blue-500 bg-blue-500/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]": answers[currentQuestion] === idx,
                  "border-[#27272a] bg-[#1d1d20] text-primary-300 hover:border-[#3f3f46] hover:bg-[#27272a]": answers[currentQuestion] !== idx
                })}
              >
                <div className="flex items-center">
                  <span className={classNames("w-8 h-8 flex items-center justify-center rounded uppercase text-sm font-bold mr-4", {
                    "bg-blue-500 text-white": answers[currentQuestion] === idx,
                    "bg-[#27272a] text-primary-500": answers[currentQuestion] !== idx
                  })}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="px-8 py-6 border-t border-[#27272a]/50 flex justify-between items-center bg-[#09090b]">
         <div className="flex gap-2">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={classNames("w-2 h-2 rounded-full transition-all", {
                  "bg-white ring-2 ring-white/20 ring-offset-2 ring-offset-[#09090b]": idx === currentQuestion,
                  "bg-blue-500": answers[idx] !== -1 && idx !== currentQuestion,
                  "bg-[#27272a]": answers[idx] === -1 && idx !== currentQuestion
                })}
              />
            ))}
         </div>

         <div className="flex gap-3">
           <button
             onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
             disabled={currentQuestion === 0}
             className="btn-secondary disabled:opacity-30 px-6 py-3 border-[#27272a]"
           >
             Prev
           </button>
           {currentQuestion === quiz.questions.length - 1 ? (
             <button
               onClick={handleSubmit}
               disabled={submitting || !allAnswered}
               className={classNames("px-8 py-3 rounded-lg font-bold text-black transition-all", {
                 "bg-white hover:bg-primary-200": allAnswered && !submitting,
                 "bg-[#27272a] text-[#52525b] cursor-not-allowed": !allAnswered || submitting
               })}
             >
               {submitting ? 'Submitting...' : 'Submit'}
             </button>
           ) : (
             <button
               onClick={() => setCurrentQuestion(currentQuestion + 1)}
               className="btn-primary px-8 py-3"
             >
               Next
             </button>
           )}
         </div>
      </footer>
    </div>
  );
};

export default QuizPage;
