import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { resolveApiUrl } from '../utils/urlResolver';
import toast from 'react-hot-toast';
import {
  Camera, Edit3, Mail, Save, Shield, User as UserIcon, Calendar,
  Globe, Activity, TrendingUp, BookOpen, Trophy, Code2, Briefcase, MessageCircle,
  Hash, Zap
} from 'lucide-react';
import classNames from 'classnames';

import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { courseService } from '../services/courseService';
import { quizService } from '../services/quizService';
import { User, Course, QuizResult, StudentEnrollment } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import { getApiError } from '../utils/apiErrorHandler';

const AVATAR_API = 'https://api.dicebear.com/9.x/miniavs/svg?seed=';

type Tab = 'details' | 'stats';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, updateUser, enrollments } = useAuth();
  const isOwnProfile = !id || id === currentUser?._id;

  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    avatar: '',
    bio: '',
    github: '',
    linkedin: '',
    twitter: '',
    website: ''
  });
  
  const [coursesManaged, setCoursesManaged] = useState<Course[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        let userToLoad: User | null = null;
        if (isOwnProfile && currentUser) {
          userToLoad = currentUser;
        } else if (id) {
          userToLoad = await userService.getProfile(id);
        }

        if (userToLoad) {
          setProfileUser(userToLoad);
          setEditForm({
            name: userToLoad.name,
            avatar: userToLoad.avatar || '',
            bio: userToLoad.bio || '',
            github: userToLoad.socialLinks?.github || '',
            linkedin: userToLoad.socialLinks?.linkedin || '',
            twitter: userToLoad.socialLinks?.twitter || '',
            website: userToLoad.socialLinks?.website || ''
          });

          if (isOwnProfile) {
            if (userToLoad.role === 'teacher' || userToLoad.role === 'admin') {
              const res = await courseService.getAll({ teacher: userToLoad._id, limit: 50 });
              setCoursesManaged(res.courses);
            } else {
              try {
                const results = await quizService.getMyResults();
                setQuizResults(results);
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    void loadProfile();
  }, [id, currentUser, isOwnProfile]);

  const getAvatarUrl = (user: User | null) => {
    if (!user) return '';
    if (user.avatar) {
      return resolveApiUrl(user.avatar);
    }
    return `${AVATAR_API}${encodeURIComponent(user.username || user.name)}`;
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      const updated = await userService.updateProfile({ 
        name: editForm.name.trim(),
        avatar: editForm.avatar.trim(),
        bio: editForm.bio.trim(),
        socialLinks: {
          github: editForm.github.trim(),
          linkedin: editForm.linkedin.trim(),
          twitter: editForm.twitter.trim(),
          website: editForm.website.trim()
        }
      });
      setProfileUser(updated);
      if (isOwnProfile) updateUser(updated);
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const avatarUrl = await userService.uploadAvatar(file);
      const updated = await userService.updateProfile({ avatar: avatarUrl });
      setProfileUser(updated);
      if (isOwnProfile) updateUser(updated);
      toast.success('Avatar updated');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to upload avatar'));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profileUser) {
    return <div className="py-20 text-center text-white">User not found.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in pb-10 px-4">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-500">
          {profileUser.role === 'teacher' || profileUser.role === 'admin' ? 'Educator Profile' : 'Student Profile'}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {profileUser.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-stretch">
        {/* Left Column: ID Card */}
        <div className="flex flex-col gap-6 h-full">
          <div className="widget-panel p-6 flex flex-col items-center text-center relative overflow-hidden group flex-1">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/5 blur-[60px] rounded-full" />
            
            <div className="relative mb-6">
              <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-[#1d1d20] bg-[#1d1d20] shadow-xl relative z-10">
                {uploading ? (
                  <div className="flex h-full w-full items-center justify-center bg-[#111111]">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : (
                  <img
                    src={getAvatarUrl(profileUser)}
                    alt={profileUser.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `${AVATAR_API}${encodeURIComponent(profileUser.name || 'User')}`;
                    }}
                  />
                )}
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#111111] bg-white text-black transition-all hover:bg-primary-400 shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            
            <div className="relative z-10 w-full flex flex-col items-center justify-center flex-1">
              <h2 className="text-xl font-bold text-white mb-2">{profileUser.name}</h2>
              <span className="tag mb-6 text-[9px] px-3 py-1">
                <Shield className="h-3 w-3 mr-1.5" />
                {profileUser.role.toUpperCase()}
              </span>
              
              <p className="text-xs text-primary-400 leading-relaxed mb-6 font-medium">
                {profileUser.bio || "No biography provided."}
              </p>

              <div className="flex flex-wrap justify-center gap-3 w-full pt-5 border-t border-[#27272a]">
                <SocialLink href={profileUser.socialLinks?.github} icon={<Code2 className="h-4 w-4" />} label="GitHub" brand="github" />
                <SocialLink href={profileUser.socialLinks?.linkedin} icon={<Briefcase className="h-4 w-4" />} label="LinkedIn" brand="linkedin" />
                <SocialLink href={profileUser.socialLinks?.twitter} icon={<MessageCircle className="h-4 w-4" />} label="Twitter" brand="twitter" />
                <SocialLink href={profileUser.socialLinks?.website} icon={<Globe className="h-4 w-4" />} label="Website" brand="web" />
              </div>
            </div>
          </div>

          <div className="widget-panel divide-y divide-[#27272a]">
            <InfoItem icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={profileUser.email} />
            <InfoItem icon={<Calendar className="w-3.5 h-3.5" />} label="Joined" value={formatDate(profileUser.createdAt)} />
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="space-y-6">
          <div className="flex bg-[#111111] p-1 rounded-2xl border border-[#27272a] h-[54px]">
            <button
              onClick={() => setActiveTab('details')}
              className={classNames("flex-1 flex items-center justify-center gap-2 text-xs font-bold rounded-xl transition-all duration-300", {
                "bg-[#1d1d20] text-white shadow-md border border-[#3f3f46]": activeTab === 'details',
                "text-primary-500 hover:text-primary-300": activeTab !== 'details'
              })}
            >
              <UserIcon className="w-3.5 h-3.5" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={classNames("flex-1 flex items-center justify-center gap-2 text-xs font-bold rounded-xl transition-all duration-300", {
                "bg-[#1d1d20] text-white shadow-md border border-[#3f3f46]": activeTab === 'stats',
                "text-primary-500 hover:text-primary-300": activeTab !== 'stats'
              })}
            >
              <Activity className="w-3.5 h-3.5" /> Activity
            </button>
          </div>

          <div className="animate-fade-in">
            {activeTab === 'details' && (
              <div className="widget-panel p-8 space-y-8">
                {isOwnProfile && (
                  <div className="flex items-center justify-between border-b border-[#27272a] pb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">{isEditing ? 'Configure Profile' : 'Profile Settings'}</h3>
                      <p className="text-xs text-primary-500 mt-1">Manage your public identity and social presence.</p>
                    </div>
                    {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="btn-secondary h-9 px-4 text-xs gap-2">
                        <Edit3 className="w-3.5 h-3.5 text-primary-500" /> Edit Profile
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isEditing ? (
                      <Field label="Legal Name" icon={<Hash />}>
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field h-11 text-sm" />
                      </Field>
                    ) : null}
                    {isEditing ? (
                      <Field label="Avatar URL" icon={<Zap />}>
                        <input value={editForm.avatar} onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })} className="input-field h-11 text-sm" />
                      </Field>
                    ) : null}
                  </div>

                  <Field label="Professional Biography" icon={<Edit3 />}>
                    {isEditing ? (
                      <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="input-field min-h-[140px] resize-none pt-3 text-sm" />
                    ) : (
                      <div className="bg-[#09090b]/50 rounded-2xl p-6 border border-[#27272a] shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-500/20 group-hover:bg-primary-500/40 transition-colors" />
                        <p className="text-sm text-primary-300 leading-relaxed whitespace-pre-wrap font-medium">
                          {profileUser.bio || 'This user has not established a professional biography yet.'}
                        </p>
                      </div>
                    )}
                  </Field>
                  
                  <div className="pt-4 space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600">Connected Platforms</span>
                      <div className="h-px flex-1 bg-[#27272a]" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {(isEditing || profileUser.socialLinks?.github) && (
                        <SocialField label="GitHub" icon={<Code2 className="h-4 w-4" />} isEditing={isEditing} value={editForm.github} onChange={(v) => setEditForm({...editForm, github: v})} displayValue={profileUser.socialLinks?.github} />
                      )}
                      {(isEditing || profileUser.socialLinks?.linkedin) && (
                        <SocialField label="LinkedIn" icon={<Briefcase className="h-4 w-4" />} isEditing={isEditing} value={editForm.linkedin} onChange={(v) => setEditForm({...editForm, linkedin: v})} displayValue={profileUser.socialLinks?.linkedin} />
                      )}
                      {(isEditing || profileUser.socialLinks?.twitter) && (
                        <SocialField label="Twitter" icon={<MessageCircle className="h-4 w-4" />} isEditing={isEditing} value={editForm.twitter} onChange={(v) => setEditForm({...editForm, twitter: v})} displayValue={profileUser.socialLinks?.twitter} />
                      )}
                      {(isEditing || profileUser.socialLinks?.website) && (
                        <SocialField label="Website" icon={<Globe className="h-4 w-4" />} isEditing={isEditing} value={editForm.website} onChange={(v) => setEditForm({...editForm, website: v})} displayValue={profileUser.socialLinks?.website} />
                      )}
                      {!isEditing && !profileUser.socialLinks?.github && !profileUser.socialLinks?.linkedin && !profileUser.socialLinks?.twitter && !profileUser.socialLinks?.website && (
                        <p className="col-span-2 text-xs text-primary-700 italic">No external platforms connected.</p>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#27272a]">
                    <button onClick={() => setIsEditing(false)} className="px-5 text-xs font-bold text-primary-500 hover:text-white transition-colors">Discard</button>
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-primary h-11 px-8 gap-2 text-xs">
                      <Save className="w-4 h-4" /> {saving ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard 
                    icon={<BookOpen className="w-5 h-5" />} 
                    label={profileUser.role === 'teacher' || profileUser.role === 'admin' ? 'Managed Courses' : 'Active Courses'}
                    value={profileUser.role === 'teacher' || profileUser.role === 'admin' ? coursesManaged.length : enrollments.length}
                    color="blue"
                  />
                  <StatCard 
                    icon={<Trophy className="w-5 h-5" />} 
                    label={profileUser.role === 'teacher' || profileUser.role === 'admin' ? 'Total Students' : 'Assessments'}
                    value={profileUser.role === 'teacher' || profileUser.role === 'admin' 
                      ? coursesManaged.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0)
                      : quizResults.length}
                    color="purple"
                  />
                </div>

                <div className="widget-panel p-8">
                  <h3 className="text-sm font-bold text-white flex items-center gap-3 mb-8">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Recent Milestones
                  </h3>
                  
                  {((profileUser.role === 'student' && enrollments.length === 0 && quizResults.length === 0) || 
                    ((profileUser.role === 'teacher' || profileUser.role === 'admin') && coursesManaged.length === 0)) ? (
                    <div className="py-12 text-center text-xs text-primary-600 font-bold uppercase tracking-widest">No activity data.</div>
                  ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:left-[11px] before:w-0.5 before:bg-[#27272a]">
                      {/* Student Timeline */}
                      {profileUser.role === 'student' && [...enrollments.map(e => ({ type: 'enrollment', date: new Date(e.enrolledAt), data: e })), ...quizResults.map(q => ({ type: 'quiz', date: new Date(q.submittedAt), data: q }))]
                        .sort((a, b) => b.date.getTime() - a.date.getTime())
                        .slice(0, 5)
                        .map((item, i) => (
                        <div key={i} className="relative pl-8 group">
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-[#111111] bg-primary-500 z-10 transition-transform group-hover:scale-110" />
                          <div className="bg-[#1d1d20]/30 rounded-2xl p-4 border border-[#27272a] hover:bg-[#1d1d20]/50 transition-colors">
                            <p className="text-xs font-bold text-white mb-1">
                              {item.type === 'enrollment' ? 'Enrolled in Course' : 'Quiz Completed'}
                            </p>
                            <p className="text-[11px] text-primary-400">
                              {item.type === 'enrollment' 
                                ? (item.data as StudentEnrollment).course && typeof (item.data as StudentEnrollment).course === 'object' ? ((item.data as StudentEnrollment).course as Course).title : 'A course'
                                : `Score: ${Math.round(((item.data as QuizResult).score / (item.data as QuizResult).totalQuestions) * 100)}% accuracy`}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Teacher Timeline */}
                      {(profileUser.role === 'teacher' || profileUser.role === 'admin') && coursesManaged
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((course, i) => (
                        <div key={i} className="relative pl-8 group">
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-[#111111] bg-purple-500 z-10 transition-transform group-hover:scale-110" />
                          <div className="bg-[#1d1d20]/30 rounded-2xl p-4 border border-[#27272a] hover:bg-[#1d1d20]/50 transition-colors">
                            <p className="text-xs font-bold text-white mb-1">Published New Course</p>
                            <p className="text-[11px] text-primary-400 truncate">{course.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified Helpers
const SocialLink: React.FC<{ href?: string; icon: React.ReactNode; label: string; brand: string }> = ({ href, icon, label }) => {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl border border-[#27272a] bg-[#1d1d20] text-primary-500 hover:text-white hover:bg-[#27272a] transition-all flex items-center justify-center" title={label}>
      <div className="w-4 h-4">{icon}</div>
    </a>
  );
};

const SocialField: React.FC<{ label: string; icon: React.ReactNode; isEditing: boolean; value: string; onChange: (v: string) => void; displayValue?: string }> = ({ label, icon, isEditing, value, onChange, displayValue }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-600">
      <span className="p-1.5 bg-[#1d1d20] rounded-lg text-primary-500">{icon}</span> {label}
    </label>
    {isEditing ? (
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input-field h-10 text-xs" />
    ) : (
      <div className="h-10 flex items-center px-4 rounded-xl border border-[#27272a] bg-[#09090b]">
        <span className={classNames("text-xs truncate", displayValue ? "text-primary-200" : "text-primary-700 italic")}>{displayValue || 'Not linked'}</span>
      </div>
    )}
  </div>
);

const Field: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-700">
      <span className="text-primary-500">{icon}</span> {label}
    </label>
    {children}
  </div>
);

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 hover:bg-[#1d1d20]/30 transition-colors">
    <div className="p-2 bg-[#1d1d20] rounded-xl text-primary-400">{icon}</div>
    <div className="overflow-hidden">
      <p className="text-[9px] font-bold uppercase tracking-widest text-primary-600 mb-0.5">{label}</p>
      <p className="text-xs font-bold text-white truncate">{value}</p>
    </div>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: 'blue' | 'purple' }> = ({ icon, label, value, color }) => (
  <div className="widget-panel p-6 flex items-center gap-5">
    <div className={classNames("w-12 h-12 flex items-center justify-center rounded-2xl shadow-inner", {
      "bg-blue-500/10 text-blue-400": color === 'blue',
      "bg-purple-500/10 text-purple-400": color === 'purple'
    })}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600 mb-1">{label}</p>
      <p className="text-2xl font-black text-white leading-none">{value}</p>
    </div>
  </div>
);

export default Profile;
