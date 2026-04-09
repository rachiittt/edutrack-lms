import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService';
import toast from 'react-hot-toast';
import { getApiError } from '../utils/apiErrorHandler';
import { ArrowLeft, Save, Layout, Settings, Image as ImageIcon } from 'lucide-react';
import classNames from 'classnames';
const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'media'>('details');
  const categories = [
    'Web Development',
    'Computer Science',
    'Artificial Intelligence',
    'Data Science',
    'Cybersecurity',
    'Cloud Computing',
    'Design',
    'Other',
  ];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await courseService.create({ title, description, category, thumbnail });
      toast.success('Project created successfully!');
      navigate(`/courses/${response.data.course._id}`);
    } catch (error) {
      toast.error(getApiError(error, 'Failed to create'));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex h-[calc(100vh-120px)] -mx-6 -mt-6 bg-[#09090b]">
      {}
      <div className="w-[500px] border-r border-[#27272a] bg-[#111111] flex flex-col pt-6 overflow-y-auto">
        <div className="px-6 pb-6 border-b border-[#27272a]">
          <button onClick={() => navigate(-1)} className="flex items-center text-xs font-semibold text-primary-500 hover:text-white uppercase tracking-wider mb-6 transition-colors">
            <ArrowLeft className="w-3 h-3 mr-2" /> Exit Studio
          </button>
          <h1 className="text-2xl font-bold text-white mb-1">New Project Setup</h1>
          <p className="text-primary-400 text-sm">Configure the metadata for your new project.</p>
        </div>
        <div className="flex px-6 pt-4 gap-4 border-b border-[#27272a]">
          <button
            onClick={() => setActiveTab('details')}
            className={classNames("pb-4 text-sm font-medium border-b-2 transition-colors", {
              "border-white text-white": activeTab === 'details',
              "border-transparent text-primary-500 hover:text-primary-300": activeTab !== 'details'
            })}
          >
            <Settings className="w-4 h-4 inline mr-1.5 align-text-bottom" /> Basics
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={classNames("pb-4 text-sm font-medium border-b-2 transition-colors", {
              "border-white text-white": activeTab === 'media',
              "border-transparent text-primary-500 hover:text-primary-300": activeTab !== 'media'
            })}
          >
            <ImageIcon className="w-4 h-4 inline mr-1.5 align-text-bottom" /> Media
          </button>
        </div>
        <form id="course-form" onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {activeTab === 'details' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-primary-300 uppercase tracking-wider mb-2">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1d1d20] border border-[#27272a] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Advanced System Design"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary-300 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1d1d20] border border-[#27272a] text-white px-4 py-3 rounded-lg min-h-[200px] resize-none focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="What will this project cover?"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary-300 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#1d1d20] border border-[#27272a] text-white px-4 py-3 rounded-lg appearance-none focus:outline-none focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="" disabled>Select a discipline</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-primary-300 uppercase tracking-wider mb-2">Cover Image URL</label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full bg-[#1d1d20] border border-[#27272a] text-primary-300 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#52525b]"
                  placeholder="https://example.com/cover.jpg"
                />
                <p className="text-xs text-primary-500 mt-2">Recommended size: 1200x630. This will be shown on the catalog and dashboard.</p>
              </div>
            </div>
          )}
        </form>
        <div className="p-6 border-t border-[#27272a] bg-[#09090b]">
           <button
             type="submit"
             form="course-form"
             disabled={isLoading || !title || !description || !category}
             className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
             {isLoading ? 'Creating...' : <><Save className="w-4 h-4" /> Publish to Studio</>}
           </button>
        </div>
      </div>
      {}
      <div className="flex-1 bg-grid p-12 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent pointer-events-none" />
        <div className="text-center mb-8 z-10 w-full max-w-2xl text-left">
          <div className="text-[10px] text-primary-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Layout className="w-4 h-4" /> Live Preview
          </div>
        </div>
        {}
        <div className="widget-panel w-full max-w-sm h-[360px] flex flex-col relative z-10 shadow-2xl scale-100 transition-all duration-300 border-[#3f3f46]">
          <div className="relative h-40 bg-[#1d1d20] border-b border-[#27272a] overflow-hidden flex items-center justify-center">
            {thumbnail ? (
              <img src={thumbnail} alt="Cover Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            ) : (
              <ImageIcon className="w-8 h-8 text-[#3f3f46]" />
            )}
          </div>
          <div className="p-5 flex-1 flex flex-col">
             <div className="text-[10px] uppercase font-bold tracking-wider text-primary-500 mb-2">{category || 'Category'}</div>
             <h3 className="text-lg font-bold text-white leading-tight mb-2 line-clamp-2">{title || 'Untitled Project'}</h3>
             <p className="text-xs text-primary-400 line-clamp-3">{description || 'Project description will appear here...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreateCourse;
