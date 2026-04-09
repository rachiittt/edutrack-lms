import React, { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { Course, PaginationInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
const CourseList: React.FC = () => {
  const { enrollments } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
    loadCategories();
  }, []);
  useEffect(() => {
    loadCourses();
  }, [page, category]);
  const loadCategories = async () => {
    try {
      const response = await courseService.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };
  const loadCourses = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      const response = await courseService.getAll(params);
      setCourses(response.data || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCourses();
  };
  const enrolledCourseIds = enrollments.map((e) =>
    typeof e.course === 'object' ? e.course._id : e.course
  );
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {}
      <div className="flex items-center gap-3 mb-2">
        <Compass className="w-8 h-8 text-blue-500" />
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Explore Projects
        </h1>
      </div>
      <p className="text-primary-400 text-lg mb-8 max-w-2xl">
        Discover highly curated learning paths and projects prepared by top experts in their respective fields.
      </p>
      {}
      <div className="bg-[#111111] border border-[#27272a] p-2 rounded-xl flex flex-col md:flex-row gap-2 shadow-widget w-full md:w-3/4 lg:w-2/3">
        <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-primary-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="w-full bg-transparent border-none text-white pl-12 pr-4 py-3 placeholder:text-primary-600 focus:outline-none focus:ring-0 font-medium"
          />
        </form>
        <div className="w-px bg-[#27272a] mx-2 hidden md:block" />
        <div className="relative flex items-center">
          <Filter className="absolute left-4 w-4 h-4 text-primary-500" />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 bg-transparent border-none text-primary-300 pl-10 pr-8 py-3 appearance-none focus:outline-none focus:ring-0 text-sm font-medium"
          >
            <option value="" className="bg-[#111111]">All Disciplines</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#111111]">
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSearch}
          className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-primary-200 transition-colors shrink-0"
        >
          Search
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <LoadingSpinner size="lg" />
        </div>
      ) : courses.length === 0 ? (
        <div className="widget-panel p-16 text-center max-w-2xl mx-auto flex flex-col items-center">
          <Search className="w-12 h-12 text-[#27272a] mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
          <p className="text-primary-500">
            We couldn't find anything matching your search criteria. Try removing some filters or searching for broader terms.
          </p>
        </div>
      ) : (
        <>
          {pagination && (
            <p className="text-sm font-medium uppercase tracking-wider text-primary-500 mb-6">
              Showing {courses.length} of {pagination.total} results
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isEnrolled={enrolledCourseIds.includes(course._id)}
              />
            ))}
          </div>
          {/* Default Dark Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-12">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-icon disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    p === page
                      ? 'bg-white text-black'
                      : 'hover:bg-[#1d1d20] text-primary-400'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="btn-icon disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default CourseList;
