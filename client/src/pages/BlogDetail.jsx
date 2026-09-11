import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiCalendar, FiUser, FiArrowLeft } from 'react-icons/fi';
import { getBlogBySlug, getBlogs } from '../api/blogApi';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import BlogCard from '../components/BlogCard';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import { formatBlogDate } from '../utils/blogFormat';
import { getBlogImageUrl } from '../utils/imageUrl';
import './BlogDetail.css';

const SITE_URL = 'https://cartowingservicedubai.com';

const BlogDetail = () => {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(false);
      setRelated([]);
      try {
        const res = await getBlogBySlug(slug);
        if (!active) return;
        setBlog(res);

        // Fetch related blogs in the same category (exclude current).
        try {
          const relRes = await getBlogs({ category: res.category, exclude: res._id, limit: 3 });
          if (active) setRelated(relRes?.data || []);
        } catch {
          // Non-critical — ignore.
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [slug]);

  const featured = getBlogImageUrl(blog);
  const date = formatBlogDate(blog?.publishedAt || blog?.createdAt);
  const pageUrl = `${SITE_URL}${pathname}`;

  const structuredData = blog
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
        headline: blog.title,
        description: blog.excerpt,
        image: featured || `${SITE_URL}/OG-Logo.webp`,
        author: {
          '@type': 'Organization',
          name: blog.author || 'Usama Car Towing',
          url: SITE_URL,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Usama Car Towing',
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/OG-Logo.webp` },
        },
        datePublished: blog.publishedAt || undefined,
        dateModified: blog.updatedAt || undefined,
        keywords: [blog.focusKeyword, ...(blog.seoKeywords || [])].filter(Boolean).join(', '),
        articleSection: blog.category,
      }
    : null;

  const breadcrumbData = blog
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: blog.title, item: pageUrl },
        ],
      }
    : null;

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading… | Usama Car Towing Blog</title>
        </Helmet>
        <Navbar />
        <PageHeader title="Loading…" crumb="Blog" />
        <section className="blog-detail blog-detail-loading">
          <div className="blog-detail-inner">
            <div className="blog-skel-img" style={{ height: 420, borderRadius: 18 }} />
            <div className="blog-skel-body" style={{ marginTop: 32 }}>
              <div className="blog-skel-meta" style={{ width: '30%' }} />
              <div className="blog-skel-title" style={{ width: '70%' }} />
              <div className="blog-skel-text" style={{ marginTop: 24 }} />
              <div className="blog-skel-text" style={{ marginTop: 10 }} />
              <div className="blog-skel-text short" style={{ marginTop: 10 }} />
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (error || !blog) {
    return (
      <>
        <Helmet>
          <title>Article Not Found | Usama Car Towing Blog</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Navbar />
        <PageHeader title="Article Not Found" crumb="Blog" />
        <section className="blog-detail">
          <div className="blog-detail-error">
            <h2>The article you requested could not be found.</h2>
            <Link to="/blog" className="blog-back-link"><FiArrowLeft /> Back to Blog</Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.metaTitle || `${blog.title} | Usama Car Towing Blog`}</title>
        <meta name="description" content={blog.metaDescription || blog.excerpt} />
        {blog.focusKeyword && <meta name="keywords" content={[blog.focusKeyword, ...(blog.seoKeywords || [])].join(', ')} />}
        <link rel="canonical" href={blog.canonicalUrl || pageUrl} />
        <meta property="og:title" content={blog.metaTitle || blog.title} />
        <meta property="og:description" content={blog.metaDescription || blog.excerpt} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Usama Car Towing" />
        {featured && <meta property="og:image" content={featured} />}
        <meta name="twitter:card" content="summary_large_image" />
        {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
        {breadcrumbData && <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>}
      </Helmet>

      <Navbar />
      <PageHeader title="BLOG" crumb={`Blog / ${blog.title}`} />

      <article className="blog-detail">
        <div className="blog-detail-inner">
          {featured && (
            <img
              src={featured}
              alt={blog.title}
              className="blog-detail-hero"
            />
          )}

          <div className="blog-detail-article">
            <div className="blog-detail-article-head">
              <span className="blog-detail-category">{blog.category}</span>
              <h1 className="blog-detail-title">{blog.title}</h1>
              <div className="blog-detail-meta">
                {date && (
                  <span className="blog-detail-meta-item">
                    <FiCalendar size={15} /> {date}
                  </span>
                )}
                {blog.author && (
                  <span className="blog-detail-meta-item">
                    <FiUser size={15} /> {blog.author}
                  </span>
                )}
              </div>
            </div>

            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="blog-related">
            <h2 className="blog-related-title">Related Articles</h2>
            <div className="blog-related-grid">
              {related.map((r) => (
                <BlogCard key={r._id} blog={r} />
              ))}
            </div>
          </div>
        )}

        <div className="blog-detail-back">
          <Link to="/blog" className="blog-back-link">
            <FiArrowLeft /> View all articles
          </Link>
        </div>
      </article>

      <CTABanner />
      <Footer />
    </>
  );
};

export default BlogDetail;