import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { materialService } from '../services/materialService';
import { quizService } from '../services/quizService';
import { Course, Material, Quiz } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../services/api';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Users,
  Clock,
  PlayCircle,
  PlusCircle,
  Trash2,
  ClipboardList,
} from 'lucide-react';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshEnrollments } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<'materials' | 'quizzes' | 'students'>('materials');

  // Material form state
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState<'text' | 'link' | 'pdf'>('text');
  const [matContent, setMatContent] = useState('');

  // Quiz form state
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDuration, setQuizDuration] = useState(15);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0 },
  ]);

  const [students, setStudents] = useState<any[]>([]);

  const isTeacherOwner = user?.role === 'teacher' && course?.teacher?._id === user?._id;

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;
    try {
      const [courseRes, matRes, quizRes] = await Promise.all([
        courseService.getById(id),
        materialService.getByCourse(id),
        quizService.getByCourse(id),
      ]);
      setCourse(courseRes.data.course);
      setMaterials(matRes.data.materials);
      setQuizzes(quizRes.data.quizzes);

      // Check enrollment
      if (user?.role === 'student') {
        try {
          const enrollRes = await api.get(`/enrollments/courses/${id}/enrollment-status`);
          setIsEnrolled(enrollRes.data.data.isEnrolled);
        } catch { /* ignore */ }
      }

      // Load students if teacher
      if (user?.role === 'teacher') {
        try {
          const studentsRes = await api.get(`/enrollments/courses/${id}/students`);
          setStudents(studentsRes.data.data.enrollments);
        } catch { /* ignore */ }
      }
    } catch (error) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!id) return;
    setEnrolling(true);
    try {
      await api.post(`/enrollments/courses/${id}/enroll`);
      setIsEnrolled(true);
      toast.success('Enrolled successfully!');
      refreshEnrollments();
      loadCourse();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await materialService.create(id, { title: matTitle, type: matType, content: matContent });
      toast.success('Material added!');
      setShowMaterialForm(false);
      setMatTitle('');
      setMatContent('');
      loadCourse();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add material');
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      await materialService.delete(materialId);
      toast.success('Material deleted');
      loadCourse();
    } catch (error: any) {
      toast.error('Failed to delete material');
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.post(`/quizzes/courses/${id}/quizzes`, {
        title: quizTitle,
        duration: quizDuration,
        questions,
      });
      toast.success('Quiz created!');
      setShowQuizForm(false);
      setQuizTitle('');
      setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
      loadCourse();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    }
  };

  const handleDeleteCourse = async () => {
    if (!id || !confirm('Are you sure you want to delete this course?')) return;
    try {
      await courseService.delete(id);
      toast.success('Course deleted');
      navigate('/courses');
    } catch (error: any) {
      toast.error('Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-surface-700 dark:text-surface-300">Course not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="btn-ghost gap-2 -ml-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
          alt={course.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <span className="badge-primary mb-3">{course.category}</span>
          <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {course.enrollmentCount} enrolled
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(course.createdAt).toLocaleDateString()}
            </span>
            <span>By {course.teacher?.name}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {user?.role === 'student' && !isEnrolled && (
          <button onClick={handleEnroll} disabled={enrolling} className="btn-accent gap-2">
            {enrolling ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <BookOpen className="w-5 h-5" />
                Enroll in Course
              </>
            )}
          </button>
        )}
        {isEnrolled && <span className="badge-accent text-sm px-4 py-2">✓ Enrolled</span>}
        {isTeacherOwner && (
          <button onClick={handleDeleteCourse} className="btn-danger gap-2 ml-auto">
            <Trash2 className="w-4 h-4" />
            Delete Course
          </button>
        )}
      </div>

      {/* Description */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3">About this course</h2>
        <p className="text-surface-600 dark:text-surface-400 leading-relaxed whitespace-pre-wrap">
          {course.description}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-200 dark:border-surface-700 flex gap-1">
        {[
          { key: 'materials', label: 'Materials', icon: FileText, count: materials.length },
          { key: 'quizzes', label: 'Quizzes', icon: ClipboardList, count: quizzes.length },
          ...(isTeacherOwner
            ? [{ key: 'students', label: 'Students', icon: Users, count: students.length }]
            : []),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-surface-100 dark:bg-surface-800">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {isTeacherOwner && (
            <button
              onClick={() => setShowMaterialForm(!showMaterialForm)}
              className="btn-primary gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Add Material
            </button>
          )}

          {showMaterialForm && (
            <form onSubmit={handleAddMaterial} className="card p-6 space-y-4">
              <input
                type="text"
                value={matTitle}
                onChange={(e) => setMatTitle(e.target.value)}
                placeholder="Material title"
                className="input-field"
                required
              />
              <select
                value={matType}
                onChange={(e) => setMatType(e.target.value as any)}
                className="input-field"
              >
                <option value="text">Text</option>
                <option value="link">Link</option>
                <option value="pdf">PDF URL</option>
              </select>
              <textarea
                value={matContent}
                onChange={(e) => setMatContent(e.target.value)}
                placeholder={matType === 'text' ? 'Enter text content...' : 'Enter URL...'}
                className="input-field min-h-[120px]"
                required
              />
              <div className="flex gap-3">
                <button type="submit" className="btn-accent">Save</button>
                <button type="button" onClick={() => setShowMaterialForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {materials.length === 0 ? (
            <div className="card p-8 text-center">
              <FileText className="w-10 h-10 text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500">No materials yet</p>
            </div>
          ) : (
            materials.map((mat) => (
              <div key={mat._id} className="card p-5 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  mat.type === 'text'
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
                    : mat.type === 'link'
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'
                    : 'bg-red-100 dark:bg-red-900/40 text-red-600'
                }`}>
                  {mat.type === 'text' ? <FileText className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-900 dark:text-white">{mat.title}</h3>
                  <span className="badge-primary text-xs mt-1">{mat.type.toUpperCase()}</span>
                  {mat.type === 'text' ? (
                    <p className="mt-3 text-sm text-surface-600 dark:text-surface-400 whitespace-pre-wrap line-clamp-4">
                      {mat.content}
                    </p>
                  ) : (
                    <a
                      href={mat.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      Open Resource <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                {isTeacherOwner && (
                  <button
                    onClick={() => handleDeleteMaterial(mat._id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          {isTeacherOwner && (
            <button
              onClick={() => setShowQuizForm(!showQuizForm)}
              className="btn-primary gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Create Quiz
            </button>
          )}

          {showQuizForm && (
            <form onSubmit={handleCreateQuiz} className="card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Quiz title"
                  className="input-field"
                  required
                />
                <input
                  type="number"
                  value={quizDuration}
                  onChange={(e) => setQuizDuration(parseInt(e.target.value))}
                  placeholder="Duration (minutes)"
                  className="input-field"
                  min={1}
                  required
                />
              </div>

              {questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-surface-700 dark:text-surface-300">
                      Question {qIdx + 1}
                    </h4>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIdx)}
                        className="text-red-500 text-xs hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)}
                    placeholder="Enter question..."
                    className="input-field"
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctAnswer === oIdx}
                          onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                          className="input-field text-sm py-2"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button type="button" onClick={addQuestion} className="btn-secondary w-full gap-2">
                <PlusCircle className="w-4 h-4" />
                Add Question
              </button>

              <div className="flex gap-3">
                <button type="submit" className="btn-accent">Create Quiz</button>
                <button type="button" onClick={() => setShowQuizForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {quizzes.length === 0 ? (
            <div className="card p-8 text-center">
              <ClipboardList className="w-10 h-10 text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500">No quizzes yet</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz._id} className="card p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-white">{quiz.title}</h3>
                    <p className="text-sm text-surface-500">
                      {quiz.questions.length} questions • {quiz.duration} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user?.role === 'student' && isEnrolled && (
                    <button
                      onClick={() => navigate(`/quiz/${quiz._id}`)}
                      className="btn-primary gap-2 text-sm py-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Start Quiz
                    </button>
                  )}
                  {isTeacherOwner && (
                    <button
                      onClick={() => navigate(`/quiz/${quiz._id}/results`)}
                      className="btn-secondary gap-2 text-sm py-2"
                    >
                      View Results
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'students' && isTeacherOwner && (
        <div className="space-y-3">
          {students.length === 0 ? (
            <div className="card p-8 text-center">
              <Users className="w-10 h-10 text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500">No students enrolled yet</p>
            </div>
          ) : (
            students.map((enrollment: any) => (
              <div key={enrollment._id} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
                  {enrollment.student?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-surface-900 dark:text-white">
                    {enrollment.student?.name}
                  </p>
                  <p className="text-sm text-surface-500">{enrollment.student?.email}</p>
                </div>
                <span className="text-xs text-surface-400">
                  Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
