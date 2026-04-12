import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  PlayCircle,
  Plus,
  Save,
  Trash2,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { materialService } from '../services/materialService';
import { quizService } from '../services/quizService';
import { Course, Material, Quiz, StudentEnrollment } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { formatDate } from '../utils/formatters';
import { getApiError } from '../utils/apiErrorHandler';

const createEmptyQuestion = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
});

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshEnrollments } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeItem, setActiveItem] = useState('overview');
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'text' as Material['type'],
    content: '',
  });
  const [quizForm, setQuizForm] = useState({
    title: '',
    duration: 30,
    questions: [createEmptyQuestion()],
  });

  const canManageCourse =
    user?.role === 'admin' || (user?.role === 'teacher' && course?.teacher?._id === user._id);

  const loadCourse = useCallback(async () => {
    if (!id) return;

    setLoading(true);

    try {
      const [nextCourse, nextMaterials, nextQuizzes] = await Promise.all([
        courseService.getById(id),
        materialService.getByCourse(id),
        quizService.getByCourse(id),
      ]);

      setCourse(nextCourse);
      setMaterials(nextMaterials);
      setQuizzes(nextQuizzes);

      if (user?.role === 'student') {
        try {
          const response = await api.get(`/enrollments/courses/${id}/enrollment-status`);
          setIsEnrolled(response.data.data.isEnrolled);
        } catch (error) {
          console.error('Failed to check enrollment status:', error);
        }
      } else {
        setIsEnrolled(false);
      }

      if (user?.role === 'teacher' || user?.role === 'admin') {
        try {
          const response = await api.get(`/enrollments/courses/${id}/students`);
          setStudents(response.data.data.enrollments);
        } catch (error) {
          console.error('Failed to load enrolled students:', error);
          setStudents([]);
        }
      } else {
        setStudents([]);
      }
    } catch (error) {
      toast.error(getApiError(error, 'Failed to load course'));
    } finally {
      setLoading(false);
    }
  }, [id, user?.role]);

  useEffect(() => {
    void loadCourse();
  }, [loadCourse]);

  const handleEnroll = async () => {
    if (!id) return;

    setEnrolling(true);
    try {
      await api.post(`/enrollments/courses/${id}/enroll`);
      setIsEnrolled(true);
      toast.success('Enrolled successfully.');
      await refreshEnrollments();
      await loadCourse();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to enroll'));
    } finally {
      setEnrolling(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!id || !window.confirm('Delete this course permanently?')) return;

    try {
      await courseService.delete(id);
      toast.success('Course deleted.');
      navigate('/courses');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to delete course'));
    }
  };

  const handleCreateMaterial = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    setIsSavingMaterial(true);
    try {
      const material = await materialService.create(id, materialForm);
      setMaterials((current) => [...current, material]);
      setMaterialForm({ title: '', type: 'text', content: '' });
      setActiveItem(`mat-${material._id}`);
      toast.success('Material added.');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to add material'));
    } finally {
      setIsSavingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!window.confirm('Delete this material?')) return;

    try {
      await materialService.delete(materialId);
      setMaterials((current) => current.filter((item) => item._id !== materialId));
      setActiveItem('overview');
      toast.success('Material deleted.');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to delete material'));
    }
  };

  const handleCreateQuiz = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    const invalidQuestion = quizForm.questions.find(
      (question) =>
        !question.questionText.trim() || question.options.some((option) => !option.trim())
    );

    if (invalidQuestion) {
      toast.error('Each question needs a prompt and four answer options.');
      return;
    }

    setIsSavingQuiz(true);
    try {
      const quiz = await quizService.create(id, {
        title: quizForm.title.trim(),
        duration: quizForm.duration,
        questions: quizForm.questions.map((question) => ({
          questionText: question.questionText.trim(),
          options: question.options.map((option) => option.trim()),
          correctAnswer: question.correctAnswer,
        })),
      });
      setQuizzes((current) => [...current, quiz]);
      setQuizForm({
        title: '',
        duration: 30,
        questions: [createEmptyQuestion()],
      });
      setActiveItem(`quiz-${quiz._id}`);
      toast.success('Quiz created.');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to create quiz'));
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const updateQuestion = (
    index: number,
    updater: (question: (typeof quizForm.questions)[number]) => (typeof quizForm.questions)[number]
  ) => {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? updater(question) : question
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return <div className="py-20 text-center text-white">Course not found.</div>;
  }

  const selectedMaterial = activeItem.startsWith('mat-')
    ? materials.find((item) => item._id === activeItem.replace('mat-', ''))
    : null;
  const selectedQuiz = activeItem.startsWith('quiz-')
    ? quizzes.find((item) => item._id === activeItem.replace('quiz-', ''))
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="widget-panel self-start p-4 lg:sticky lg:top-24">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </button>

        <div className="mb-6 border-b border-[#27272a] pb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-500">
            Course
          </p>
          <h1 className="text-xl font-semibold text-white">{course.title}</h1>
          <p className="mt-2 text-sm text-primary-500">{course.teacher?.name}</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-500">
              Overview
            </p>
            <button
              onClick={() => setActiveItem('overview')}
              className={classNames(
                'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                {
                  'bg-white text-black': activeItem === 'overview',
                  'text-primary-300 hover:bg-[#1d1d20] hover:text-white': activeItem !== 'overview',
                }
              )}
            >
              <BookOpen className="h-4 w-4" />
              Summary
            </button>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-500">
                Materials
              </p>
              {canManageCourse && (
                <button
                  onClick={() => setActiveItem('new-material')}
                  className="btn-icon"
                  aria-label="Add material"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-1">
              {materials.length === 0 && (
                <p className="px-3 py-2 text-sm text-primary-500">No materials yet.</p>
              )}
              {materials.map((material) => (
                <button
                  key={material._id}
                  onClick={() => setActiveItem(`mat-${material._id}`)}
                  className={classNames(
                    'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                    {
                      'bg-white text-black': activeItem === `mat-${material._id}`,
                      'text-primary-300 hover:bg-[#1d1d20] hover:text-white':
                        activeItem !== `mat-${material._id}`,
                    }
                  )}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{material.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-500">
                Assessments
              </p>
              {canManageCourse && (
                <button
                  onClick={() => setActiveItem('new-quiz')}
                  className="btn-icon"
                  aria-label="Add quiz"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-1">
              {quizzes.length === 0 && (
                <p className="px-3 py-2 text-sm text-primary-500">No quizzes yet.</p>
              )}
              {quizzes.map((quiz) => (
                <button
                  key={quiz._id}
                  onClick={() => setActiveItem(`quiz-${quiz._id}`)}
                  className={classNames(
                    'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                    {
                      'bg-white text-black': activeItem === `quiz-${quiz._id}`,
                      'text-primary-300 hover:bg-[#1d1d20] hover:text-white':
                        activeItem !== `quiz-${quiz._id}`,
                    }
                  )}
                >
                  <ClipboardList className="h-4 w-4 shrink-0" />
                  <span className="truncate">{quiz.title}</span>
                </button>
              ))}
            </div>
          </div>

          {canManageCourse && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-500">
                Administration
              </p>
              <button
                onClick={() => setActiveItem('students')}
                className={classNames(
                  'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                  {
                    'bg-white text-black': activeItem === 'students',
                    'text-primary-300 hover:bg-[#1d1d20] hover:text-white': activeItem !== 'students',
                  }
                )}
              >
                <Users className="h-4 w-4" />
                Student Roster ({students.length})
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="space-y-6">
        {activeItem === 'overview' && (
          <div className="space-y-6 animate-slide-up">
            {course.thumbnail && (
              <div className="overflow-hidden rounded-3xl border border-[#27272a]">
                <img src={course.thumbnail} alt={course.title} className="h-72 w-full object-cover" />
              </div>
            )}

            <div className="widget-panel p-6">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-primary-400">
                <span className="rounded-full border border-[#27272a] bg-[#1d1d20] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-300">
                  {course.category}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.enrollmentCount} enrolled
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Created {formatDate(course.createdAt)}
                </span>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-4xl font-bold tracking-tight text-white">{course.title}</h2>
                  <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-primary-300">
                    {course.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {user?.role === 'student' && !isEnrolled && (
                    <button onClick={handleEnroll} disabled={enrolling} className="btn-primary">
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}

                  {canManageCourse && (
                    <>
                      <button onClick={() => setActiveItem('new-material')} className="btn-secondary">
                        Add Material
                      </button>
                      <button onClick={() => setActiveItem('new-quiz')} className="btn-secondary">
                        Add Quiz
                      </button>
                      <button
                        onClick={handleDeleteCourse}
                        className="inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 font-semibold text-red-300 transition-colors hover:bg-red-500/20"
                      >
                        Delete Course
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeItem === 'new-material' && canManageCourse && (
          <form onSubmit={handleCreateMaterial} className="widget-panel space-y-5 p-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-semibold text-white">Add Material</h2>
              <p className="mt-1 text-sm text-primary-500">
                Create text notes, a document link, or a reference URL for this course.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-primary-300">Title</label>
                <input
                  value={materialForm.title}
                  onChange={(event) =>
                    setMaterialForm((current) => ({ ...current, title: event.target.value }))
                  }
                  className="input-field"
                  placeholder="Week 1 notes"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-primary-300">Type</label>
                <select
                  value={materialForm.type}
                  onChange={(event) =>
                    setMaterialForm((current) => ({
                      ...current,
                      type: event.target.value as Material['type'],
                    }))
                  }
                  className="input-field"
                >
                  <option value="text">Text</option>
                  <option value="link">Link</option>
                  <option value="pdf">PDF Link</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-primary-300">
                  {materialForm.type === 'text' ? 'Content' : 'URL'}
                </label>
                <textarea
                  value={materialForm.content}
                  onChange={(event) =>
                    setMaterialForm((current) => ({ ...current, content: event.target.value }))
                  }
                  className="input-field min-h-[180px] resize-y"
                  placeholder={
                    materialForm.type === 'text'
                      ? 'Enter the material content'
                      : 'https://example.com/resource'
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setActiveItem('overview')} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSavingMaterial} className="btn-primary gap-2">
                <Save className="h-4 w-4" />
                {isSavingMaterial ? 'Saving...' : 'Save Material'}
              </button>
            </div>
          </form>
        )}

        {selectedMaterial && (
          <div className="widget-panel space-y-6 p-6 animate-slide-up">
            <div className="flex flex-col gap-4 border-b border-[#27272a] pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-500">
                  {selectedMaterial.type}
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{selectedMaterial.title}</h2>
              </div>

              {canManageCourse && (
                <button
                  onClick={() => handleDeleteMaterial(selectedMaterial._id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 font-semibold text-red-300 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>

            {selectedMaterial.type === 'text' ? (
              <div className="whitespace-pre-wrap text-base leading-7 text-primary-200">
                {selectedMaterial.content}
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-2xl border border-[#27272a] bg-[#1d1d20] p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#27272a] bg-[#111111]">
                    <LinkIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">External resource</p>
                    <p className="text-sm text-primary-500">{selectedMaterial.content}</p>
                  </div>
                </div>
                <a href={selectedMaterial.content} target="_blank" rel="noreferrer" className="btn-primary gap-2">
                  Open <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        )}

        {activeItem === 'new-quiz' && canManageCourse && (
          <form onSubmit={handleCreateQuiz} className="widget-panel space-y-6 p-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-semibold text-white">Create Quiz</h2>
              <p className="mt-1 text-sm text-primary-500">
                Add a timed multiple-choice assessment for enrolled students.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
              <div>
                <label className="mb-2 block text-sm font-medium text-primary-300">Quiz Title</label>
                <input
                  value={quizForm.title}
                  onChange={(event) =>
                    setQuizForm((current) => ({ ...current, title: event.target.value }))
                  }
                  className="input-field"
                  placeholder="Module 1 assessment"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-primary-300">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  value={quizForm.duration}
                  onChange={(event) =>
                    setQuizForm((current) => ({
                      ...current,
                      duration: Number(event.target.value) || 1,
                    }))
                  }
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              {quizForm.questions.map((question, index) => (
                <div key={index} className="rounded-2xl border border-[#27272a] bg-[#111111] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Question {index + 1}</h3>
                    {quizForm.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setQuizForm((current) => ({
                            ...current,
                            questions: current.questions.filter((_, currentIndex) => currentIndex !== index),
                          }))
                        }
                        className="text-sm font-medium text-red-300 hover:text-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-primary-300">
                        Prompt
                      </label>
                      <textarea
                        value={question.questionText}
                        onChange={(event) =>
                          updateQuestion(index, (current) => ({
                            ...current,
                            questionText: event.target.value,
                          }))
                        }
                        className="input-field min-h-[110px] resize-y"
                        placeholder="Enter the question prompt"
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex}>
                          <label className="mb-2 block text-sm font-medium text-primary-300">
                            Option {String.fromCharCode(65 + optionIndex)}
                          </label>
                          <input
                            value={option}
                            onChange={(event) =>
                              updateQuestion(index, (current) => ({
                                ...current,
                                options: current.options.map((currentOption, currentOptionIndex) =>
                                  currentOptionIndex === optionIndex
                                    ? event.target.value
                                    : currentOption
                                ),
                              }))
                            }
                            className="input-field"
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-primary-300">
                        Correct Answer
                      </label>
                      <select
                        value={question.correctAnswer}
                        onChange={(event) =>
                          updateQuestion(index, (current) => ({
                            ...current,
                            correctAnswer: Number(event.target.value),
                          }))
                        }
                        className="input-field"
                      >
                        {question.options.map((_, optionIndex) => (
                          <option key={optionIndex} value={optionIndex}>
                            Option {String.fromCharCode(65 + optionIndex)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setQuizForm((current) => ({
                    ...current,
                    questions: [...current.questions, createEmptyQuestion()],
                  }))
                }
                className="btn-secondary"
              >
                Add Question
              </button>

              <div className="flex gap-3">
                <button type="button" onClick={() => setActiveItem('overview')} className="btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuiz || !quizForm.title.trim()}
                  className="btn-primary gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSavingQuiz ? 'Saving...' : 'Save Quiz'}
                </button>
              </div>
            </div>
          </form>
        )}

        {selectedQuiz && (
          <div className="widget-panel space-y-6 p-6 animate-slide-up">
            <div className="border-b border-[#27272a] pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-500">
                Assessment
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{selectedQuiz.title}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-primary-400">
                <span>{selectedQuiz.duration} minutes</span>
                <span>{selectedQuiz.questions.length} questions</span>
              </div>
            </div>

            {user?.role === 'student' && isEnrolled ? (
              <div className="rounded-2xl border border-[#27272a] bg-[#111111] p-8 text-center">
                <div className="mb-5 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300">
                    <PlayCircle className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white">Ready to begin?</h3>
                <p className="mx-auto mt-2 max-w-md text-primary-400">
                  Once you start, the timer begins immediately. Make sure you are ready before continuing.
                </p>
                <button onClick={() => navigate(`/quiz/${selectedQuiz._id}`)} className="btn-primary mt-6">
                  Start Quiz
                </button>
              </div>
            ) : canManageCourse ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/quiz/${selectedQuiz._id}/results`)}
                    className="btn-secondary"
                  >
                    View Results
                  </button>
                </div>
                {selectedQuiz.questions.map((question, index) => (
                  <div key={index} className="rounded-2xl border border-[#27272a] bg-[#111111] p-5">
                    <p className="mb-4 font-medium text-white">
                      <span className="mr-2 text-primary-500">{index + 1}.</span>
                      {question.questionText}
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={classNames('rounded-xl border px-4 py-3 text-sm', {
                            'border-green-500/50 bg-green-500/10 text-green-100':
                              question.correctAnswer === optionIndex,
                            'border-[#27272a] text-primary-400':
                              question.correctAnswer !== optionIndex,
                          })}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-yellow-100">
                Enroll in this course to take the quiz.
              </div>
            )}
          </div>
        )}

        {activeItem === 'students' && canManageCourse && (
          <div className="widget-panel overflow-hidden animate-slide-up">
            <div className="border-b border-[#27272a] p-6">
              <h2 className="text-2xl font-semibold text-white">Student Roster</h2>
              <p className="mt-1 text-sm text-primary-500">
                {students.length} enrolled student{students.length !== 1 ? 's' : ''}
              </p>
            </div>

            {students.length === 0 ? (
              <div className="p-6 text-primary-500">No students are enrolled yet.</div>
            ) : (
              <table className="w-full text-left text-sm text-primary-300">
                <thead className="border-b border-[#27272a] bg-[#1d1d20] text-xs font-semibold uppercase tracking-wider text-primary-500">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Enrollment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {students.map((student) => (
                    <tr key={student._id} className="transition-colors hover:bg-[#1d1d20]/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-sm font-semibold text-white">
                            {student.student?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{student.student?.name}</p>
                            <p className="text-xs text-primary-500">{student.student?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{formatDate(student.enrolledAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
