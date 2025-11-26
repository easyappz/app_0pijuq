import React from 'react';
import './styles.css';

const PostCard = ({ post, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getCommentsCount = () => {
    // Если в API есть поле comments_count, используем его
    // Иначе возвращаем 0 по умолчанию
    return post.comments_count || 0;
  };

  return (
    <div 
      className="post-card" 
      onClick={onClick}
      data-easytag="id5-src/components/PostCard/index.jsx"
    >
      <div className="post-card-header">
        <div className="author-info">
          <div className="author-avatar">
            {post.author?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="author-details">
            <div className="author-name">
              {post.author?.username || 'Аноним'}
            </div>
            <div className="post-date">
              {formatDate(post.created_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="post-card-content">
        <p>{post.content}</p>
      </div>

      <div className="post-card-footer">
        <div className="post-stats">
          <div className="stat-item">
            <svg 
              className="stat-icon" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{getCommentsCount()} комментариев</span>
          </div>
          {post.updated_at !== post.created_at && (
            <div className="edited-badge">
              Изменено
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
