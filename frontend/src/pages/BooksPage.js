import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { bookService } from '../services/api';
import { FaSearch, FaFilter } from 'react-icons/fa';

const BooksPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    class_name: '',
    university: '',
    minPrice: '',
    maxPrice: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1
  });
  const [searchTerm, setSearchTerm] = useState('');

  const subjects = ['Programming', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Economics'];
  const classes = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

  useEffect(() => {
    fetchBooks();
  }, [filters]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await bookService.getBooks(filters);
      setBooks(response.data.data.books || []);
      setPagination({
        total: response.data.data.total,
        pages: response.data.data.pages,
        currentPage: response.data.data.currentPage
      });
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleViewDetails = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  return (
    <div>
      {/* Search and Filter Section */}
      <div className="bg-light py-8">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-6">Browse Books</h1>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Subject Filter */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Subject</label>
              <select
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Class</label>
              <select
                name="class_name"
                value={filters.class_name}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Min Price Filter */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Min Price</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="0"
                className="input-field"
              />
            </div>

            {/* Max Price Filter */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Max Price</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="9999"
                className="input-field"
              />
            </div>

            {/* Reset Filters Button */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  subject: '',
                  class_name: '',
                  university: '',
                  minPrice: '',
                  maxPrice: '',
                  page: 1
                })}
                className="btn-secondary w-full"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin border-4 border-blue-600 border-t-transparent rounded-full w-12 h-12"></div>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl text-gray-600 mb-4">No books found</p>
              <p className="text-gray-500">Try adjusting your filters or browse all books</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="text-gray-700">
                    Page {pagination.currentPage} of {pagination.pages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.pages}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default BooksPage;
