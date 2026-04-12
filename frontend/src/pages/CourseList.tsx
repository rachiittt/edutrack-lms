import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { courseService } from '../services/courseService';
import { Course, PaginationInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CourseList: React.FC = () => {
  const { enrollments } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const activeSearch = searchParams.get('search') ?? '';
  const activeCategory = searchParams.get('category') ?? '';

  useEffect(() => {
    setSearch(activeSearch);
    setCategory(activeCategory);
  }, [activeCategory, activeSearch]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, activeSearch]);

  const loadCategories = useCallback(async () => {
    try {
      const nextCategories = await courseService.getCategories();
      setCategories(nextCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  const loadCourses = useCallback(async () => {
    setLoading(true);

    try {
      const response = await courseService.getAll({
        page,
        limit: 12,
        search: activeSearch || undefined,
        category: activeCategory || undefined,
      });
      setCourses(response.courses);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSearch, page]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const syncFilters = (nextSearch: string, nextCategory: string) => {
    const nextParams = new URLSearchParams();

    if (nextSearch) {
      nextParams.set('search', nextSearch);
    }

    if (nextCategory) {
      nextParams.set('category', nextCategory);
    }

    setSearchParams(nextParams);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    syncFilters(search.trim(), category);
  };

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    setPage(1);
    syncFilters(search.trim(), nextCategory);
  };

  const enrolledCourseIds = enrollments.map((enrollment) =>
    typeof enrollment.course === 'object' ? enrollment.course._id : enrollment.course
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Course Catalog</h1>
            <p className="text-primary-400">
              Browse available courses, filter by category, and continue learning where you left off.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 rounded-2xl border border-[#27272a] bg-[#111111] p-3 shadow-widget lg:flex-row lg:items-center">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-500" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, topic, or keyword"
            className="input-field pl-12"
          />
        </form>

        <div className="relative lg:w-64">
          <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500" />
          <select
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="input-field appearance-none pl-11 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setPage(1);
            syncFilters(search.trim(), category);
          }}
          className="btn-primary px-6"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : courses.length === 0 ? (
        <div className="widget-panel mx-auto flex max-w-2xl flex-col items-center p-16 text-center">
          <Search className="mb-4 h-12 w-12 text-[#27272a]" />
          <h3 className="mb-2 text-xl font-bold text-white">No courses found</h3>
          <p className="text-primary-500">
            Try a broader keyword or remove one of the filters to see more results.
          </p>
        </div>
      ) : (
        <>
          {pagination && (
            <p className="text-sm font-medium uppercase tracking-wider text-primary-500">
              Showing {courses.length} of {pagination.total} courses
            </p>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isEnrolled={enrolledCourseIds.includes(course._id)}
              />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-12">
              <button
                onClick={() => setPage((current) => current - 1)}
                disabled={page === 1}
                className="btn-icon disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: pagination.pages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`h-10 w-10 rounded-lg text-sm font-bold transition-all ${
                    pageNumber === page
                      ? 'bg-white text-black'
                      : 'text-primary-400 hover:bg-[#1d1d20]'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={page === pagination.pages}
                className="btn-icon disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseList;
