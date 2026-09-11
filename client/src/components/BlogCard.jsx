import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar } from 'react-icons/fi';
import { getBlogImageUrl } from '../utils/imageUrl';
import { formatBlogDate } from '../utils/blogFormat';
import './BlogCard.css';

const BlogCard = ({ blog }) => {
  const image = getBlogImageUrl(blog);
  const date = formatBlogDate(blog.publishedAt || blog.createdAt);

  return (
    <article className="blog-card">
      <Link to={`/blog/${blog.slug}`} className="blog-card-media" aria-label={blog.title}>
        {image ? (
          <img src={image} alt={blog.title} loading="lazy" decoding="async" />
        ) : (
          <div className="blog-card-noimg" aria-hidden="true">
            <span>Usama Car Towing</span>
          </div>
        )}
        <span className="blog-card-category">{blog.category}</span>
      </Link>

      <div className="blog-card-body">
        <div className="blog-card-meta">
          {date && (
            <span className="blog-card-date">
              <FiCalendar size={14} />
              {date}
            </span>
          )}
          {blog.author && <span className="blog-card-author">By {blog.author}</span>}
        </div>

        <h3 className="blog-card-title">
          <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
        </h3>

        <p className="blog-card-excerpt">{blog.excerpt}</p>

        <Link to={`/blog/${blog.slug}`} className="blog-card-link">
          Read More <FiArrowRight />
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;