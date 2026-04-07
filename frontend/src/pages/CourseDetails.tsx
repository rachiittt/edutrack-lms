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
import classNames from 'classnames';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Users,
  Clock,
  PlayCircle,
  Plus,
  Trash2,
  ClipboardList,
  MoreVertical,
  ChevronRight
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
  
  // View states
  const [activeItem, setActiveItem] = useState<string>('overview');
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

      if (user?.role === 'student') {
        try {
          const enrollRes = await api.get(`/enrollments/courses/${id}/enrollment-status`);
          setIsEnrolled(enrollRes.data.data.isEnrolled);
        } catch { /* ignore */ }
      }

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

  const handleDeleteCourse = async () => {
    if (!id || !confirm('Permanently delete this project?')) return;
    try {
      await courseService.delete(id);
      toast.success('Project deleted');
      navigate('/courses');
    } catch (error: any) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;
  if (!course) return <div className="text-center py-20 text-white">Project not found</div>;

  return (
    <div className="flex h-[calc(100vh-120px)] -mx-6 -mt-6 bg-[#09090b]">
      
      {/* LEFT SIDEBAR - Workspace Outline */}
      <div className="w-64 border-r border-[#27272a] bg-[#09090b] flex flex-col pt-6 overflow-y-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-xs text-primary-500 hover:text-white px-4 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3 h-3 mr-1" /> Back
        </button>

        <div className="px-4 mb-4">
          <div className="text-[10px] font-semibold text-primary-500 uppercase tracking-wider mb-2">Outline</div>
          <button 
            onClick={() => setActiveItem('overview')}
            className={classNames('w-full flex items-center px-2 py-1.5 rounded-md text-sm transition-colors', {
              'bg-[#1d1d20] text-white': activeItem === 'overview',
              'text-primary-400 hover:text-white hover:bg-[#111111]': activeItem !== 'overview'
            })}
          >
            <BookOpen className="w-4 h-4 mr-2" /> Overview
          </button>
        </div>

        <div className="px-4 mb-4">
          <div className="flex items-center justify-between text-[10px] font-semibold text-primary-500 uppercase tracking-wider mb-2">
            <span>Materials</span>
            {isTeacherOwner && <Plus className="w-3 h-3 cursor-pointer hover:text-white" />}
          </div>
          {materials.length === 0 && <div className="text-xs text-primary-600 px-2">No materials</div>}
          {materials.map((mat) => (
            <button 
              key={mat._id}
              onClick={() => setActiveItem(`mat-${mat._id}`)}
              className={classNames('w-full flex items-center px-2 py-1.5 rounded-md text-sm transition-colors', {
                'bg-[#1d1d20] text-white': activeItem === `mat-${mat._id}`,
                'text-primary-400 hover:text-white hover:bg-[#111111]': activeItem !== `mat-${mat._id}`
              })}
            >
              <FileText className="w-4 h-4 mr-2 shrink-0" /> 
              <span className="truncate">{mat.title}</span>
            </button>
          ))}
        </div>

        <div className="px-4 mb-4">
          <div className="flex items-center justify-between text-[10px] font-semibold text-primary-500 uppercase tracking-wider mb-2">
            <span>Assessments</span>
            {isTeacherOwner && <Plus className="w-3 h-3 cursor-pointer hover:text-white" />}
          </div>
          {quizzes.length === 0 && <div className="text-xs text-primary-600 px-2">No assessments</div>}
          {quizzes.map((quiz) => (
            <button 
              key={quiz._id}
              onClick={() => setActiveItem(`quiz-${quiz._id}`)}
              className={classNames('w-full flex items-center px-2 py-1.5 rounded-md text-sm transition-colors', {
                'bg-[#1d1d20] text-white': activeItem === `quiz-${quiz._id}`,
                'text-primary-400 hover:text-white hover:bg-[#111111]': activeItem !== `quiz-${quiz._id}`
              })}
            >
              <ClipboardList className="w-4 h-4 mr-2 shrink-0" /> 
              <span className="truncate">{quiz.title}</span>
            </button>
          ))}
        </div>

        {isTeacherOwner && (
          <div className="px-4 mt-auto pb-4">
            <button 
              onClick={() => setActiveItem('students')}
              className={classNames('w-full flex items-center px-2 py-1.5 rounded-md text-sm transition-colors', {
                'bg-[#1d1d20] text-white': activeItem === 'students',
                'text-primary-400 hover:text-white hover:bg-[#111111]': activeItem !== 'students'
              })}
            >
              <Users className="w-4 h-4 mr-2" /> Directory ({students.length})
            </button>
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 bg-[#111111] overflow-y-auto w-full relative">
        <div className="max-w-4xl mx-auto px-8 py-12">
          
          {/* OVERVIEW RENDER */}
          {activeItem === 'overview' && (
            <div className="animate-slide-up space-y-8">
              {course.thumbnail && (
                <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-[#27272a] shadow-2xl relative group">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
                  {isEnrolled && (
                     <div className="absolute top-4 left-4 bg-green-500/20 text-green-400 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md rounded border border-green-500/30">
                       Enrolled Workspace
                     </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 text-primary-400 text-sm mb-3">
                    <span className="px-2 py-0.5 bg-[#1d1d20] border border-[#27272a] rounded text-xs font-semibold uppercase">{course.category}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.enrollmentCount}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
                    {course.title}
                  </h1>
                </div>

                {!isTeacherOwner && user?.role === 'student' && !isEnrolled && (
                  <button onClick={handleEnroll} disabled={enrolling} className="btn-primary text-black bg-white shrink-0">
                    {enrolling ? 'Processing...' : 'Enroll Now'}
                  </button>
                )}
              </div>

              <div className="prose prose-invert prose-lg max-w-none prose-p:text-primary-300 prose-p:leading-relaxed">
                <p>{course.description}</p>
              </div>

              {isTeacherOwner && (
                <div className="pt-8 border-t border-[#27272a] mt-12 flex justify-end">
                  <button onClick={handleDeleteCourse} className="text-red-500 text-sm font-medium hover:text-red-400 flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Delete Project
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MATERIAL RENDER */}
          {activeItem.startsWith('mat-') && (() => {
            const mat = materials.find(m => m._id === activeItem.replace('mat-', ''));
            if (!mat) return null;
            return (
              <div className="animate-slide-up space-y-6">
                <div className="flex items-center gap-3 text-primary-400 text-sm mb-4">
                  <span className="uppercase text-xs font-bold tracking-wider">{mat.type}</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-8">{mat.title}</h1>
                
                {mat.type === 'text' ? (
                  <div className="text-primary-200 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                    {mat.content}
                  </div>
                ) : (
                  <div className="widget-panel p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-[#1d1d20] flex items-center justify-center border border-[#27272a]">
                        <LinkIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">External Resource</h3>
                        <p className="text-sm text-primary-500 truncate max-w-md">{mat.content}</p>
                      </div>
                    </div>
                    <a href={mat.content} target="_blank" rel="noreferrer" className="btn-primary text-sm px-4">
                      Open <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </a>
                  </div>
                )}
              </div>
            );
          })()}

          {/* QUIZ RENDER */}
          {activeItem.startsWith('quiz-') && (() => {
            const quiz = quizzes.find(q => q._id === activeItem.replace('quiz-', ''));
            if (!quiz) return null;
            return (
              <div className="animate-slide-up space-y-6">
                <div className="flex items-center gap-3 text-primary-400 text-sm mb-4">
                  <span className="uppercase text-xs font-bold tracking-wider">Assessment</span>
                  <span>{quiz.duration} Minutes</span>
                  <span>{quiz.questions.length} Questions</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">{quiz.title}</h1>
                
                {user?.role === 'student' && isEnrolled ? (
                  <div className="widget-panel p-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                      <PlayCircle className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl text-white font-semibold mb-2">Ready to begin?</h3>
                    <p className="text-primary-400 mb-8 max-w-sm">Once you start, the timer will begin. Make sure you are in a distraction-free environment.</p>
                    <button onClick={() => navigate(`/quiz/${quiz._id}`)} className="btn-primary px-8">
                      Start Assessment
                    </button>
                  </div>
                ) : isTeacherOwner ? (
                  <div className="widget-panel p-8">
                     <div className="flex items-center justify-between mb-6">
                       <h3 className="text-lg font-medium text-white">Teacher Preview</h3>
                       <button onClick={() => navigate(`/quiz/${quiz._id}/results`)} className="btn-secondary text-sm">View Analytics</button>
                     </div>
                     <div className="space-y-4">
                       {quiz.questions.map((q, i) => (
                         <div key={i} className="p-4 bg-[#1d1d20] border border-[#27272a] rounded-lg">
                           <p className="font-medium text-white mb-3"><span className="text-primary-500 mr-2">{i+1}.</span> {q.questionText}</p>
                           <div className="grid grid-cols-2 gap-2">
                             {q.options.map((opt, j) => (
                               <div key={j} className={classNames("px-3 py-2 text-sm rounded border", {
                                 "border-green-500/50 bg-green-500/10 text-green-200": q.correctAnswer === j,
                                 "border-[#27272a] text-primary-400": q.correctAnswer !== j
                               })}>
                                 {opt}
                               </div>
                             ))}
                           </div>
                         </div>
                       ))}
                     </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 rounded">
                    Please enroll in the course to take this assessment.
                  </div>
                )}
              </div>
            );
          })()}

          {/* STUDENTS RENDER */}
          {activeItem === 'students' && isTeacherOwner && (
            <div className="animate-slide-up space-y-6">
               <h1 className="text-3xl font-bold text-white mb-2">Student Directory</h1>
               <p className="text-primary-400 mb-8">{students.length} students enrolled</p>
               
               <div className="widget-panel overflow-hidden">
                 <table className="w-full text-left text-sm text-primary-300">
                   <thead className="bg-[#1d1d20] border-b border-[#27272a] text-primary-500 uppercase text-xs font-semibold">
                     <tr>
                       <th className="px-6 py-4">Student</th>
                       <th className="px-6 py-4">Enrollment Date</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[#27272a]">
                     {students.map((e) => (
                       <tr key={e._id} className="hover:bg-[#1d1d20]/50 transition-colors">
                         <td className="px-6 py-4 flex items-center gap-3">
                           <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">{e.student?.name?.charAt(0)}</div>
                           <div>
                             <div className="font-medium text-white">{e.student?.name}</div>
                             <div className="text-xs">{e.student?.email}</div>
                           </div>
                         </td>
                         <td className="px-6 py-4">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
