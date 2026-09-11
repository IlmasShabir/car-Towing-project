import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiBookOpen, FiX } from 'react-icons/fi';
import { getBlogs } from '../api/blogApi';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import BlogCard from '../components/BlogCard';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import './Blog.css';

const PAGE_SIZE = 9;

const Blog = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 320);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    const params = { page, limit: PAGE_SIZE };
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;
    getBlogs(params)
      .then((res) => {
        if (active) {
          setData(res);
          setError('');
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [page, debouncedSearch, category, reloadKey]);

  const categories = data?.categories || [];

  return (
    <>
      <Helmet>
        <title>Blog | Usama Car Towing — Dubai Roadside Assistance Tips</title>
        <meta
          name="description"
          content="Expert guides and tips on car towing, roadside assistance, battery replacement and recovery in Dubai. Stay informed with Usama Car Towing."
        />
        <link rel="canonical" href="https://cartowingservicedubai.com/blog" />
        <meta property="og:title" content="Blog — Usama Car Towing | Dubai Towing & Roadside Assistance" />
        <meta property="og:description" content="Expert guides and tips on car towing, roadside assistance, battery replacement and recovery in Dubai." />
        <meta property="og:url" content="https://cartowingservicedubai.com/blog" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />
      <PageHeader title="OUR BLOG" crumb="Blog" />

      <section className="blog-listing">
        <div className="blog-listing-toolbar">
          <div className="blog-search-wrapper">
            <FiSearch className="blog-search-icon" />
            <input
              type="text"
              className="blog-search-input"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search blogs"
            />
            {search && (
              <button className="blog-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                <FiX />
              </button>
            )}
          </div>

          {categories.length > 0 && (
            <div className="blog-category-filter">
              <button
                className={`blog-cat-btn${category === '' ? ' active' : ''}`}
                onClick={() => { setCategory(''); setPage(1); }}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`blog-cat-btn${category === cat ? ' active' : ''}`}
                  onClick={() => { setCategory(category === cat ? '' : cat); setPage(1); }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && !data ? (
          <div className="blog-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="blog-card blog-card-skeleton" key={i}>
                <div className="blog-skel-img" />
                <div className="blog-skel-body">
                  <div className="blog-skel-meta" />
                  <div className="blog-skel-title" />
                  <div className="blog-skel-text" />
                  <div className="blog-skel-text short" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="blog-state-box">
            <p className="blog-state-error">{error}</p>
            <button
              className="blog-retry-btn"
              onClick={() => { setError(''); setData(null); setReloadKey((k) => k + 1); }}
            >
              Try again
            </button>
          </div>
        ) : data && data.data.length === 0 ? (
          <div className="blog-state-box">
            <span className="blog-state-icon"><FiBookOpen /></span>
            <h3 className="blog-state-title">
              {debouncedSearch || category ? 'No articles match your filters' : 'No articles yet'}
            </h3>
            <p className="blog-state-text">
              {debouncedSearch || category
                ? 'Try a different search term or category.'
                : 'New blog posts will appear here once published.'}
            </p>
          </div>
        ) : (
          <>
            <div className="blog-grid" data-od-id="blog-grid">
              {data.data.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>

            {data.pages > 1 && (
              <nav className="blog-pagination" aria-label="Blog pages">
                <button
                  className="blog-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Previous page"
                >
                  ← Prev
                </button>
                {Array.from({ length: data.pages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      className={`blog-page-btn${p === page ? ' active' : ''}`}
                      onClick={() => setPage(p)}
                      aria-current={p === page ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  className="blog-page-btn"
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next page"
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </section>

      <CTABanner />
      <Footer />
    </>
  );
};

export default Blog;