import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resolveApiUrl } from '../utils/urlResolver';
import toast from 'react-hot-toast';
import {
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
  ArrowLeft,
  Settings,
  Upload,
  Image as ImageIcon,
  UserPlus,
  Layout,
  BarChart,
  ChevronRight,
  GraduationCap,
  Mail,
  LogOut
} from 'lucide-react';
import classNames from 'classnames';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { materialService } from '../services/materialService';
import { quizService } from '../services/quizService';
import { userService } from '../services/userService';
import api from '../services/api';
import { Course, Material, Quiz } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import { getApiError } from '../utils/apiErrorHandler';
import ConfirmModal from '../components/ConfirmModal';
import StudentProgressModal from '../components/StudentProgressModal';

const createEmptyQuestion = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
});

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, enrollments, refreshEnrollments } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<{ _id: string; student: { _id: string; name: string; username: string; email: string; avatar?: string }; progress: number; enrolledAt: string }[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeItem, setActiveItem] = useState<string>('overview');
  
  // Modals state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: (() => void) | null;
    variant: 'danger' | 'warning';
  }>({ isOpen: false, title: '', message: '', action: null, variant: 'danger' });

  const [progressConfig, setProgressConfig] = useState<{
    isOpen: boolean;
    student: { name: string; email: string } | null;
    studentId: string;
  }>({ isOpen: false, student: null, studentId: '' });

  // Forms state
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [materialForm, setMaterialForm] = useState<{
    title: string;
    type: Material['type'];
    content: string;
  }>({ title: '', type: 'text', content: '' });

  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    duration: 30,
    questions: [createEmptyQuestion()],
  });

  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editCourseForm, setEditCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: '',
  });

  const isOwner =
    user?.role === 'admin' ||
    (course && user && ((course.teacher?._id || course.teacher) === user._id));
  
  const isCollaborator = 
    course?.collaborators?.some(c => (typeof c === 'string' ? c : c._id) === user?._id);

  const canManageCourse = isOwner || isCollaborator;

  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);

  const loadCourse = useCallback(async () => {
    if (!id) return;
    try {
      const data = await courseService.getById(id);
      setCourse(data);
      setEditCourseForm({
        title: data.title,
        description: data.description,
        category: data.category,
        thumbnail: data.thumbnail || '',
      });

      const [mats, qzs] = await Promise.all([
        materialService.getByCourse(id),
        quizService.getByCourse(id),
      ]);
      setMaterials(mats);
      setQuizzes(qzs);

      if (user?.role === 'student') {
        const enrolled = enrollments?.some(
          (e) => (typeof e.course === 'string' ? e.course : e.course._id) === id
        );
        setIsEnrolled(!!enrolled);
      }

      if (canManageCourse) {
        const response = await api.get(`/enrollments/courses/${id}/students`);
        setStudents(response.data.data.enrollments);
      }
    } catch (error) {
      toast.error(getApiError(error, 'Failed to load course details'));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, user, enrollments, navigate, canManageCourse]);

  useEffect(() => {
    void loadCourse();
  }, [loadCourse]);

  const handleEnroll = async () => {
    if (!id) return;
    setEnrolling(true);
    try {
      await api.post(`/enrollments/courses/${id}/enroll`);
      toast.success('Successfully enrolled in course!');
      setIsEnrolled(true);
      await refreshEnrollments();
      await loadCourse();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to enroll in course'));
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = () => {
    requestConfirm('Leave Course', 'Are you sure you want to unenroll from this course? Your progress and quiz results will be permanently removed.', async () => {
      try {
        await api.delete(`/enrollments/courses/${id}/enroll`);
        toast.success('Successfully unenrolled from course.');
        setIsEnrolled(false);
        await refreshEnrollments();
        await loadCourse();
      } catch (error) {
        toast.error(getApiError(error, 'Failed to unenroll from course'));
      } finally {
        closeConfirm();
      }
    });
  };

  const requestConfirm = (title: string, message: string, action: () => void, variant: 'danger' | 'warning' = 'danger') => {
    setConfirmConfig({ isOpen: true, title, message, action, variant });
  };

  const closeConfirm = () => {
    setConfirmConfig({ ...confirmConfig, isOpen: false });
  };

  const handleDeleteCourse = () => {
    requestConfirm('Delete Course', 'Are you sure you want to delete this course? This action is permanent and will remove all materials, quizzes, and student progress.', async () => {
      try {
        await courseService.delete(id!);
        toast.success('Course deleted.');
        navigate('/dashboard');
      } catch (error) {
        toast.error(getApiError(error, 'Failed to delete course'));
      } finally {
        closeConfirm();
      }
    });
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingCourse(true);
    try {
      const updated = await courseService.update(id!, editCourseForm);
      setCourse(updated);
      setIsEditingCourse(false);
      setActiveItem('overview');
      toast.success('Course updated successfully');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to update course'));
    } finally {
      setIsEditingCourse(false);
    }
  };

  const handleRemoveStudent = (enrollmentId: string, studentName: string) => {
    requestConfirm('Remove Student', `Are you sure you want to remove ${studentName} from this course?`, async () => {
      try {
        await api.delete(`/enrollments/${enrollmentId}`);
        toast.success('Student removed.');
        await loadCourse();
      } catch (error) {
        toast.error(getApiError(error, 'Failed to remove student'));
      } finally {
        closeConfirm();
      }
    });
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaboratorEmail.trim() || !id) return;
    setIsAddingCollaborator(true);
    try {
      const updatedCourse = await courseService.addCollaborator(id, collaboratorEmail.trim());
      setCourse(updatedCourse);
      setCollaboratorEmail('');
      toast.success('Collaborator added successfully');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to add collaborator'));
    } finally {
      setIsAddingCollaborator(false);
    }
  };

  const handleRemoveCollaborator = (collaboratorId: string, collaboratorName: string) => {
    requestConfirm('Remove Collaborator', `Are you sure you want to remove ${collaboratorName} from this course?`, async () => {
      try {
        const updatedCourse = await courseService.removeCollaborator(id!, collaboratorId);
        setCourse(updatedCourse);
        toast.success('Collaborator removed.');
      } catch (error) {
        toast.error(getApiError(error, 'Failed to remove collaborator'));
      } finally {
        closeConfirm();
      }
    });
  };

  const handleCreateMaterial = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    setIsSavingMaterial(true);
    try {
      await materialService.create(id, materialForm);
      toast.success('Material added successfully');
      setMaterialForm({ title: '', type: 'text', content: '' });
      setActiveItem('overview');
      await loadCourse();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to add material'));
    } finally {
      setIsSavingMaterial(false);
    }
  };

  const handleDeleteMaterial = (materialId: string) => {
    requestConfirm('Delete Material', 'Are you sure you want to remove this material?', async () => {
      try {
        await materialService.delete(materialId);
        toast.success('Material deleted.');
        setActiveItem('overview');
        await loadCourse();
      } catch (error) {
        toast.error(getApiError(error, 'Failed to delete material'));
      } finally {
        closeConfirm();
      }
    });
  };

  const handleCreateQuiz = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    setIsSavingQuiz(true);
    try {
      await quizService.create(id, quizForm);
      toast.success('Quiz created successfully');
      setQuizForm({ title: '', duration: 30, questions: [createEmptyQuestion()] });
      setActiveItem('overview');
      await loadCourse();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to create quiz'));
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const updateQuestion = (idx: number, updater: (q: { questionText: string; options: string[]; correctAnswer: number }) => { questionText: string; options: string[]; correctAnswer: number }) => {
    setQuizForm(p => ({
      ...p,
      questions: p.questions.map((q, i) => i === idx ? updater(q) : q)
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) return null;

  const selectedMaterial = materials.find((m) => `mat-${m._id}` === activeItem);
  const selectedQuiz = quizzes.find((q) => `quiz-${q._id}` === activeItem);

  return (
    <>
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onCancel={closeConfirm}
        onConfirm={() => confirmConfig.action?.()}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
      />

      <StudentProgressModal
        isOpen={progressConfig.isOpen}
        onClose={() => setProgressConfig({ ...progressConfig, isOpen: false })}
        student={progressConfig.student}
        studentId={progressConfig.studentId}
        courseId={id!}
      />

      <div className={classNames("grid gap-8 items-stretch", {
        "lg:grid-cols-[300px_1fr]": activeItem !== 'edit-course',
        "lg:grid-cols-1": activeItem === 'edit-course'
      })}>
        {activeItem !== 'edit-course' && (
          <aside className="widget-panel p-5 lg:sticky lg:top-24 h-full">
            <button
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 transition-all hover:text-white group"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              Return
            </button>

            <div className="mb-6 border-b border-[#27272a] pb-6">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary-600">
                Course Engine
              </p>
              <h1 className="text-xl font-bold text-white line-clamp-2 leading-tight">{course.title}</h1>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                  <GraduationCap className="h-3 w-3 text-primary-400" />
                </div>
                <p className="text-xs font-semibold text-primary-400">{course.teacher?.name}</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Main Section */}
              <nav className="space-y-1">
                <SidebarButton 
                  isActive={activeItem === 'overview'} 
                  onClick={() => setActiveItem('overview')}
                  icon={<Layout className="h-4 w-4" />}
                  label="Course Overview"
                />
              </nav>

              {/* Content Section */}
              <div className="space-y-4">
                <SidebarSectionHeader 
                  label="Learning Path" 
                  onAction={canManageCourse ? () => setActiveItem('new-material') : undefined}
                />
                <div className="space-y-1">
                  {materials.length === 0 && <p className="px-3 py-2 text-xs text-primary-600 italic">No materials published.</p>}
                  {materials.map((m) => (
                    <SidebarButton 
                      key={m._id}
                      isActive={activeItem === `mat-${m._id}`}
                      onClick={() => setActiveItem(`mat-${m._id}`)}
                      icon={<FileText className="h-4 w-4" />}
                      label={m.title}
                      truncate
                    />
                  ))}
                </div>
              </div>

              {/* Assessment Section */}
              <div className="space-y-4">
                <SidebarSectionHeader 
                  label="Knowledge Checks" 
                  onAction={canManageCourse ? () => setActiveItem('new-quiz') : undefined}
                />
                <div className="space-y-1">
                  {quizzes.length === 0 && <p className="px-3 py-2 text-xs text-primary-600 italic">No assessments yet.</p>}
                  {quizzes.map((q) => (
                    <SidebarButton 
                      key={q._id}
                      isActive={activeItem === `quiz-${q._id}`}
                      onClick={() => setActiveItem(`quiz-${q._id}`)}
                      icon={<ClipboardList className="h-4 w-4" />}
                      label={q.title}
                      truncate
                    />
                  ))}
                </div>
              </div>

              {/* Management Section */}
              {canManageCourse && (
                <div className="pt-4 border-t border-[#27272a] space-y-4">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600">Administration</p>
                  <div className="space-y-1">
                    <SidebarButton 
                      isActive={activeItem === 'students'}
                      onClick={() => setActiveItem('students')}
                      icon={<Users className="h-4 w-4" />}
                      label={`Students (${students.length})`}
                    />
                    {isOwner && (
                      <SidebarButton 
                        isActive={activeItem === 'collaborators'}
                        onClick={() => setActiveItem('collaborators')}
                        icon={<UserPlus className="h-4 w-4" />}
                        label={`Co-Teachers (${course.collaborators?.length || 0})`}
                      />
                    )}
                    <div className="pt-2 space-y-1">
                      <SidebarButton 
                        isActive={activeItem === 'edit-course'}
                        onClick={() => setActiveItem('edit-course')}
                        icon={<Settings className="h-4 w-4" />}
                        label="Modify Course"
                      />
                      {isOwner && (
                        <button 
                          onClick={handleDeleteCourse}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 border border-transparent text-red-400/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" /> Archive Course
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        <div className="space-y-8 min-w-0">
          {activeItem === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="relative group overflow-hidden rounded-3xl border border-[#27272a] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-60 z-10" />
                <img src={resolveApiUrl(course.thumbnail) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80'} alt={course.title} className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                
                <div className="absolute bottom-6 left-8 z-20">
                  <span className="tag mb-3 bg-primary-500 text-white border-primary-400/30">
                    {course.category}
                  </span>
                  <h2 className="text-4xl font-black tracking-tight text-white">{course.title}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <div className="space-y-8 h-full">
                  <div className="widget-panel p-8 h-full">
                    <h3 className="text-xl font-bold text-white mb-6">Course Syllabus</h3>
                    <p className="text-base leading-relaxed text-primary-300 whitespace-pre-wrap mb-8">
                      {course.description}
                    </p>

                    <div className="pt-8 border-t border-[#27272a]">
                      <h3 className="text-xl font-bold text-white mb-6">Meet your Instructor</h3>
                      <div className="flex items-center gap-5">
                        <img 
                          src={resolveApiUrl(course.teacher.avatar) || `https://api.dicebear.com/9.x/miniavs/svg?seed=${encodeURIComponent(course.teacher.username || course.teacher.name)}`} 
                          alt={course.teacher.name} 
                          className="w-20 h-20 rounded-2xl border border-[#27272a] object-cover shadow-2xl"
                        />
                        <div>
                          <button 
                            onClick={() => navigate(`/profile/${course.teacher._id}`)}
                            className="text-xl font-black text-white hover:text-primary-400 transition-colors text-left"
                          >
                            {course.teacher.name}
                          </button>
                          <p className="text-xs text-primary-500 font-bold uppercase tracking-widest mt-1">Lead Educator</p>
                        </div>
                      </div>
                      {course.teacher.bio && (
                        <div className="mt-6 p-4 rounded-2xl bg-[#111111] border border-[#27272a] relative">
                          <div className="absolute -top-3 left-6 px-2 bg-[#111111] text-[10px] font-bold text-primary-600 uppercase tracking-tighter">Instructor Bio</div>
                          <p className="text-sm text-primary-400 italic leading-relaxed">
                            "{course.teacher.bio}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                <div className="h-full">
                  <div className="widget-panel p-8 h-full flex flex-col">
                    {((user?.role === 'student' && !isEnrolled) || isEnrolled) && (
                      <div className="mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-500 mb-5">Status & Enrollment</h4>
                        {user?.role === 'student' && !isEnrolled ? (
                          <button onClick={handleEnroll} disabled={enrolling} className="btn-primary w-full h-14 text-base shadow-2xl shadow-primary-500/20">
                            {enrolling ? 'Processing...' : 'Enroll in Course'}
                          </button>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center gap-3 text-emerald-400 font-bold text-sm bg-emerald-500/5 h-14 px-6 rounded-2xl border border-emerald-500/20 shadow-inner">
                              <PlayCircle className="w-5 h-5" /> Currently Enrolled
                            </div>
                            <button onClick={handleUnenroll} className="w-full text-xs font-bold text-primary-500 hover:text-red-400 transition-colors py-2 flex items-center justify-center gap-2">
                              <LogOut className="w-3.5 h-3.5" /> Leave Course / Revoke Access
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className=" border-[#27272a] mt-auto">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-500 mb-5">Course Metrics</h4>
                       <div className="grid grid-cols-1 gap-4">
                       <MetaCard icon={<Users className="w-4.5 h-4.5" />} label="Active Students" value={course.enrollmentCount} />
                       <MetaCard icon={<Clock className="w-4.5 h-4.5" />} label="Last Activity" value={formatDate(course.updatedAt)} />
                       <MetaCard icon={<BarChart className="w-4.5 h-4.5" />} label="Course Level" value="Beginner-Friendly" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {activeItem === 'edit-course' && canManageCourse && (
            <div className="animate-fade-in">
               <button onClick={() => setActiveItem('overview')} className="mb-6 flex items-center gap-2 text-sm font-bold text-primary-400 hover:text-white transition-colors">
                 <ArrowLeft className="w-4 h-4" /> Back to Dashboard
               </button>
               
               <form onSubmit={handleUpdateCourse} className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
                  <div className="widget-panel p-8 space-y-8">
                    <div className="border-b border-[#27272a] pb-6">
                      <h2 className="text-3xl font-black text-white">Course Configuration</h2>
                      <p className="text-sm text-primary-500 mt-2">Fine-tune the metadata and appearance of your course.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Display Title">
                          <input value={editCourseForm.title} onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })} className="input-field h-12" required />
                        </Field>
                        <Field label="Categorization">
                          <input value={editCourseForm.category} onChange={(e) => setEditCourseForm({ ...editCourseForm, category: e.target.value })} className="input-field h-12" required />
                        </Field>
                      </div>

                      <Field label="Public Description">
                        <textarea value={editCourseForm.description} onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })} className="input-field min-h-[160px] pt-3 resize-none" required />
                      </Field>

                      <Field label="Cover Visual (URL or Upload)">
                        <div className="flex gap-3">
                           <input value={editCourseForm.thumbnail} onChange={(e) => setEditCourseForm({ ...editCourseForm, thumbnail: e.target.value })} className="input-field h-12 flex-1" placeholder="https://..." />
                           <div className="relative">
                              <input id="edit-thumb-upload" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                 const file = e.target.files?.[0];
                                 if (!file) return;
                                 const tid = toast.loading('Syncing visual...');
                                 try {
                                    const url = await userService.uploadThumbnail(file);
                                    setEditCourseForm(p => ({ ...p, thumbnail: url }));
                                    toast.success('Visual updated', { id: tid });
                                 } catch { toast.error('Sync failed', { id: tid }); }
                              }} />
                              <label htmlFor="edit-thumb-upload" className="btn-secondary h-12 px-4 cursor-pointer flex items-center"><Upload className="w-5 h-5" /></label>
                           </div>
                        </div>
                      </Field>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-[#27272a]">
                      <button type="button" onClick={() => setActiveItem('overview')} className="px-6 font-bold text-primary-500 hover:text-white transition-colors">Discard</button>
                      <button type="submit" disabled={isEditingCourse} className="btn-primary px-8 h-12 gap-2 shadow-xl shadow-primary-500/10">
                        <Save className="w-4.5 h-4.5" /> {isEditingCourse ? 'Syncing...' : 'Push Changes'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="widget-panel p-1 relative overflow-hidden bg-grid border-[#3f3f46]">
                       <div className="p-3 bg-[#111111] border-b border-[#27272a] text-[10px] font-black uppercase tracking-widest text-primary-500 flex justify-between items-center">
                         <span>Real-time Preview</span>
                         <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       </div>
                       <div className="p-12 flex justify-center items-center">
                         <div className="widget-panel w-full max-w-[280px] overflow-hidden shadow-2xl ring-1 ring-white/5">
                            <div className="h-32 bg-[#1d1d20] border-b border-[#27272a] overflow-hidden flex items-center justify-center">
                              {editCourseForm.thumbnail ? (
                                <img src={resolveApiUrl(editCourseForm.thumbnail)} className="w-full h-full object-cover" />
                              ) : <ImageIcon className="w-8 h-8 text-[#3f3f46]" />}
                            </div>
                            <div className="p-4 bg-[#09090b]">
                              <div className="text-[10px] uppercase font-bold tracking-wider text-primary-500 mb-1">{editCourseForm.category || 'CATEGORY'}</div>
                              <h4 className="text-sm font-bold text-white line-clamp-2 mb-2">{editCourseForm.title || 'Untitled'}</h4>
                              <div className="h-8 overflow-hidden"><p className="text-[10px] text-primary-400 line-clamp-2 leading-relaxed">{editCourseForm.description}</p></div>
                            </div>
                         </div>
                       </div>
                    </div>
                  </div>
               </form>
            </div>
          )}

          {activeItem === 'students' && canManageCourse && (
            <div className="widget-panel overflow-hidden animate-slide-up">
              <div className="border-b border-[#27272a] p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Student Roster</h2>
                  <p className="mt-1 text-sm text-primary-500 font-medium">
                    {students.length} learner{students.length !== 1 ? 's' : ''} currently enrolled.
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="input-field h-11 pl-11 text-xs"
                  />
                </div>
              </div>

              {students.length === 0 ? (
                <div className="p-16 text-center">
                   <Users className="w-12 h-12 text-[#1d1d20] mx-auto mb-4" />
                   <p className="text-primary-600 font-medium">No students registered for this course yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#1d1d20]/50 text-[10px] font-black uppercase tracking-[0.2em] text-primary-500">
                        <th className="px-8 py-5 border-b border-[#27272a]">Individual</th>
                        <th className="px-8 py-5 border-b border-[#27272a]">Registration Date</th>
                        <th className="px-8 py-5 border-b border-[#27272a] text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a]">
                      {students
                        .filter(e => 
                          e.student.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          e.student.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          e.student.username?.toLowerCase().includes(studentSearch.toLowerCase())
                        )
                        .map((e) => (
                        <tr key={e._id} className="group transition-colors hover:bg-[#1d1d20]/30">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-primary-500/20 to-purple-500/20 border border-primary-500/30 flex items-center justify-center font-bold text-primary-300">
                                {e.student?.name?.charAt(0)}
                              </div>
                              <div>
                                <button onClick={() => navigate(`/profile/${e.student?._id}`)} className="font-bold text-white hover:text-primary-400 transition-colors">
                                  {e.student?.name}
                                </button>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-primary-500 font-medium">{e.student?.email}</p>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20 font-bold tracking-tight">@{e.student?.username}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-primary-400 font-medium">{formatDate(e.enrolledAt)}</td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setProgressConfig({ isOpen: true, student: e.student, studentId: e.student._id })} className="btn-secondary h-9 px-4 text-xs">Analytics</button>
                              <button onClick={() => handleRemoveStudent(e._id, e.student.name)} className="h-9 px-4 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">Expel</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeItem === 'collaborators' && isOwner && (
            <div className="widget-panel overflow-hidden animate-slide-up">
              <div className="border-b border-[#27272a] p-8 bg-gradient-to-r from-[#1d1d20]/30 to-transparent">
                <h2 className="text-2xl font-black text-white">Instructional Team</h2>
                <p className="mt-1 text-sm text-primary-500 font-medium">Manage educators who share administrative rights for this course. Search by email or unique username.</p>
              </div>

              <div className="p-8 border-b border-[#27272a] bg-[#111111]/50">
                <form onSubmit={handleAddCollaborator} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 w-full">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600" />
                    <input
                      type="text"
                      placeholder="Collaborator's email or username..."
                      value={collaboratorEmail}
                      onChange={(e) => setCollaboratorEmail(e.target.value)}
                      className="input-field h-12 pl-11"
                      required
                    />
                  </div>
                  <button type="submit" disabled={isAddingCollaborator || !collaboratorEmail.trim()} className="btn-primary px-10 h-12 gap-2 w-full sm:w-auto shadow-lg shadow-primary-500/20">
                    <UserPlus className="h-4.5 w-4.5" /> {isAddingCollaborator ? 'Syncing...' : 'Grant Access'}
                  </button>
                </form>
              </div>

              {!course.collaborators || course.collaborators.length === 0 ? (
                <div className="p-20 text-center">
                   <div className="p-4 bg-[#1d1d20] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-[#27272a]">
                     <UserPlus className="w-8 h-8 text-primary-600" />
                   </div>
                   <p className="text-primary-600 font-bold uppercase tracking-widest text-[10px]">Solo Instructor Mode</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#27272a] border-b border-[#27272a]">
                  {course.collaborators.map((c: { _id: string; name: string; email: string; avatar?: string }) => (
                    <div key={c._id} className="bg-[#09090b] flex items-center justify-between p-8 transition-colors hover:bg-[#1d1d20]/30">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[#27272a] bg-[#1d1d20] shadow-lg">
                          <img
                            src={resolveApiUrl(c.avatar) || `https://api.dicebear.com/9.x/miniavs/svg?seed=${encodeURIComponent(c.name)}`}
                            alt={c.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-black text-white text-lg tracking-tight">{c.name}</p>
                          <p className="text-xs text-primary-500 font-bold uppercase tracking-widest">{c.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCollaborator(c._id, c.name)}
                        className="h-11 w-11 flex items-center justify-center rounded-xl text-primary-600 transition-all hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/20"
                        title="Revoke Access"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fallback for Materials and Quizzes */}
          {(selectedMaterial || selectedQuiz || activeItem === 'new-material' || activeItem === 'new-quiz') && (
             <div className="animate-fade-in">
               <button onClick={() => setActiveItem('overview')} className="mb-6 flex items-center gap-2 text-sm font-bold text-primary-400 hover:text-white transition-colors">
                 <ArrowLeft className="w-4 h-4" /> Back to Dashboard
               </button>
               
               {activeItem === 'new-material' && (
                 <form onSubmit={handleCreateMaterial} className="widget-panel space-y-6 p-8 shadow-2xl">
                    <div className="border-b border-[#27272a] pb-6">
                      <h2 className="text-3xl font-black text-white">Publish Material</h2>
                      <p className="text-sm text-primary-500 mt-2">Distribute knowledge, resources, or links to your students.</p>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Material Identifier">
                          <input value={materialForm.title} onChange={e => setMaterialForm(p => ({ ...p, title: e.target.value }))} className="input-field h-12" placeholder="e.g. Week 1 Foundations" required />
                        </Field>
                        <Field label="Content Format">
                          <select value={materialForm.type} onChange={e => setMaterialForm(p => ({ ...p, type: e.target.value as Material['type'] }))} className="input-field h-12">
                            <option value="text">Rich Text Notes</option>
                            <option value="link">External URL</option>
                            <option value="pdf">Document Link (PDF)</option>
                          </select>
                        </Field>
                      </div>
                      <Field label={materialForm.type === 'text' ? 'Body Content' : 'Resource URL'}>
                        {materialForm.type === 'text' ? (
                          <div className="rounded-2xl border border-[#27272a] bg-[#09090b] overflow-hidden min-h-[300px]">
                            <ReactQuill theme="snow" value={materialForm.content} onChange={v => setMaterialForm(p => ({ ...p, content: v }))} className="text-white h-full" />
                          </div>
                        ) : (
                          <input type="url" value={materialForm.content} onChange={e => setMaterialForm(p => ({ ...p, content: e.target.value }))} className="input-field h-12" placeholder="https://..." required />
                        )}
                      </Field>
                    </div>
                    <div className="flex justify-end gap-4 pt-8 border-t border-[#27272a]">
                      <button type="button" onClick={() => setActiveItem('overview')} className="px-6 font-bold text-primary-500 hover:text-white transition-colors">Cancel</button>
                      <button type="submit" disabled={isSavingMaterial} className="btn-primary h-12 px-8 gap-2 shadow-xl shadow-primary-500/10">
                        <Save className="w-4.5 h-4.5" /> {isSavingMaterial ? 'Syncing...' : 'Publish Material'}
                      </button>
                    </div>
                 </form>
               )}

               {selectedMaterial && (
                 <div className="widget-panel p-10 space-y-10 animate-slide-up">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#27272a] pb-8">
                       <div>
                          <span className="tag">{selectedMaterial.type} resource</span>
                          <h2 className="text-4xl font-black text-white mt-2 leading-tight">{selectedMaterial.title}</h2>
                       </div>
                       {canManageCourse && (
                         <button onClick={() => handleDeleteMaterial(selectedMaterial._id)} className="btn-secondary text-red-400 border-red-500/20 hover:bg-red-500/10 h-11 px-6">
                           <Trash2 className="w-4 h-4 mr-2" /> Delete
                         </button>
                       )}
                    </div>
                    
                    {selectedMaterial.type === 'text' ? (
                      <div className="prose prose-invert max-w-none prose-p:text-primary-300 prose-headings:text-white prose-strong:text-white prose-code:text-primary-400" dangerouslySetInnerHTML={{ __html: selectedMaterial.content }} />
                    ) : (
                      <div className="flex flex-col md:flex-row items-center justify-between p-8 rounded-[32px] border border-[#27272a] bg-[#1d1d20]/50 gap-6">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 flex items-center justify-center bg-[#09090b] rounded-2xl border border-[#27272a] shadow-inner text-primary-400">
                               <LinkIcon className="w-7 h-7" />
                            </div>
                            <div>
                               <p className="text-lg font-bold text-white">External Document</p>
                               <p className="text-sm text-primary-500 font-medium truncate max-w-[300px]">{selectedMaterial.content}</p>
                            </div>
                         </div>
                         <a href={selectedMaterial.content} target="_blank" rel="noreferrer" className="btn-primary h-12 px-8 gap-2 group">
                            Open Resource <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                         </a>
                      </div>
                    )}
                 </div>
               )}

               {activeItem === 'new-quiz' && (
                 <form onSubmit={handleCreateQuiz} className="widget-panel p-8 space-y-8 shadow-2xl">
                    <div className="border-b border-[#27272a] pb-6">
                      <h2 className="text-3xl font-black text-white">Design Assessment</h2>
                      <p className="text-sm text-primary-500 mt-2">Construct a rigorous quiz to validate student understanding.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">
                       <Field label="Assessment Title">
                         <input value={quizForm.title} onChange={e => setQuizForm(p => ({ ...p, title: e.target.value }))} className="input-field h-12" placeholder="e.g. Mid-Term Proficiency" required />
                       </Field>
                       <Field label="Time Limit (Min)">
                         <input type="number" min={1} value={quizForm.duration} onChange={e => setQuizForm(p => ({ ...p, duration: Number(e.target.value) || 1 }))} className="input-field h-12" required />
                       </Field>
                    </div>

                    <div className="space-y-8">
                       {quizForm.questions.map((q, idx) => (
                         <div key={idx} className="widget-panel p-6 border-[#3f3f46] relative bg-[#111111]/30">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#27272a]/50">
                               <h4 className="text-sm font-bold uppercase tracking-widest text-primary-400">Question Segment {idx + 1}</h4>
                               {quizForm.questions.length > 1 && (
                                 <button type="button" onClick={() => setQuizForm(p => ({ ...p, questions: p.questions.filter((_, i) => i !== idx) }))} className="text-xs font-bold text-red-400 hover:text-red-300">Remove</button>
                               )}
                            </div>
                            <div className="space-y-6">
                               <Field label="Instructional Prompt">
                                 <textarea value={q.questionText} onChange={e => updateQuestion(idx, p => ({ ...p, questionText: e.target.value }))} className="input-field min-h-[100px] pt-3 resize-none" placeholder="What is the primary factor..." required />
                               </Field>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="space-y-2">
                                       <label className="text-[9px] font-bold uppercase tracking-widest text-primary-600">Option {String.fromCharCode(65 + optIdx)}</label>
                                       <input value={opt} onChange={e => updateQuestion(idx, p => ({ ...p, options: p.options.map((o: string, i: number) => i === optIdx ? e.target.value : o) }))} className="input-field h-11 text-xs" required />
                                    </div>
                                  ))}
                               </div>
                               <Field label="Designated Correct Answer">
                                 <select value={q.correctAnswer} onChange={e => updateQuestion(idx, p => ({ ...p, correctAnswer: Number(e.target.value) }))} className="input-field h-11 text-xs max-w-xs">
                                   {q.options.map((_, i) => <option key={i} value={i}>Choice {String.fromCharCode(65 + i)}</option>)}
                                 </select>
                               </Field>
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="flex justify-between items-center pt-8 border-t border-[#27272a]">
                       <button type="button" onClick={() => setQuizForm(p => ({ ...p, questions: [...p.questions, createEmptyQuestion()] }))} className="btn-secondary h-11 px-6 text-xs font-bold">Add Question Module</button>
                       <div className="flex gap-4">
                         <button type="button" onClick={() => setActiveItem('overview')} className="px-6 font-bold text-primary-500 hover:text-white transition-colors">Discard</button>
                         <button type="submit" disabled={isSavingQuiz} className="btn-primary h-11 px-8 gap-2 shadow-xl shadow-primary-500/10">
                           <Save className="w-4 h-4" /> {isSavingQuiz ? 'Publishing...' : 'Confirm Quiz'}
                         </button>
                       </div>
                    </div>
                 </form>
               )}

               {selectedQuiz && (
                 <div className="widget-panel p-10 space-y-10 animate-slide-up">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#27272a] pb-8">
                       <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Skill Assessment</span>
                          <h2 className="text-4xl font-black text-white mt-2 leading-tight">{selectedQuiz.title}</h2>
                          <div className="flex gap-6 mt-4 text-xs font-bold text-primary-500 uppercase tracking-widest">
                             <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {selectedQuiz.duration} Minutes</span>
                             <span className="flex items-center gap-2"><BarChart className="w-3.5 h-3.5" /> {selectedQuiz.questions.length} Concepts</span>
                          </div>
                       </div>
                       {canManageCourse && (
                         <button onClick={() => navigate(`/quiz/${selectedQuiz._id}/results`)} className="btn-secondary h-11 px-8 shadow-sm">View Analytics</button>
                       )}
                    </div>

                    {user?.role === 'student' && isEnrolled ? (
                      <div className="bg-[#111111] rounded-3xl border border-[#27272a] p-16 text-center shadow-inner">
                         <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary-500/20">
                            <PlayCircle className="w-10 h-10 text-primary-500" />
                         </div>
                         <h3 className="text-2xl font-black text-white mb-4">Are you prepared to begin?</h3>
                         <p className="text-primary-500 max-w-sm mx-auto mb-10 font-medium">This is a timed assessment. Ensure you have a stable connection and enough time before starting.</p>
                         <button onClick={() => navigate(`/quiz/${selectedQuiz._id}`)} className="btn-primary px-12 h-14 text-lg shadow-2xl shadow-primary-500/20">Engage Assessment</button>
                      </div>
                    ) : canManageCourse ? (
                      <div className="space-y-6">
                        {selectedQuiz.questions.map((q, i) => (
                          <div key={i} className="widget-panel p-8 bg-[#111111]/30">
                             <p className="text-lg font-bold text-white mb-6 leading-relaxed">
                               <span className="text-primary-500 mr-4 font-black">0{i + 1}</span> {q.questionText}
                             </p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {q.options.map((opt, oIdx) => (
                                 <div key={oIdx} className={classNames("p-4 rounded-2xl border text-sm font-bold transition-all", {
                                   "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/5": q.correctAnswer === oIdx,
                                   "bg-[#1d1d20]/50 border-[#27272a] text-primary-500": q.correctAnswer !== oIdx
                                 })}>
                                   <span className="mr-3 text-[10px] opacity-40 uppercase">Choice {String.fromCharCode(65 + oIdx)}</span>
                                   {opt}
                                 </div>
                               ))}
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    </>
  );
};

// Helper Components for Sidebar
const SidebarButton: React.FC<{ isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string; truncate?: boolean }> = ({ isActive, onClick, icon, label, truncate }) => (
  <button
    onClick={onClick}
    className={classNames(
      'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 border',
      {
        'bg-white text-black border-white shadow-lg shadow-white/5': isActive,
        'text-primary-400 border-transparent hover:bg-[#1d1d20] hover:text-white hover:border-[#27272a]': !isActive,
      }
    )}
  >
    <span className={classNames("transition-colors", isActive ? "text-black" : "text-primary-500")}>{icon}</span>
    <span className={classNames("flex-1 text-left", { "truncate": truncate })}>{label}</span>
    {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-40" />}
  </button>
);

const SidebarSectionHeader: React.FC<{ label: string; onAction?: () => void }> = ({ label, onAction }) => (
  <div className="flex items-center justify-between px-3 mb-2 mt-6 first:mt-0">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-600">{label}</p>
    {onAction && (
      <button onClick={onAction} className="p-1.5 rounded-xl bg-[#1d1d20] text-primary-400 hover:text-white hover:bg-[#27272a] transition-all border border-[#27272a] shadow-sm">
        <Plus className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);

const MetaCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="group flex items-center gap-4 bg-[#111111] p-4 rounded-2xl border border-[#27272a] hover:border-primary-500/30 transition-all duration-300">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20 group-hover:bg-primary-500 group-hover:text-black transition-colors">
      {icon}
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-black uppercase tracking-widest text-primary-600">{label}</span>
      <span className="text-xs font-bold text-white">{value}</span>
    </div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2.5">
    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 px-1">{label}</label>
    {children}
  </div>
);

export default CourseDetails;
