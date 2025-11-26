import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPost, deletePost } from '../../api/posts';
import { getComments, createComment } from '../../api/comments';
import CommentCard from '../../components/CommentCard';
import './styles.css';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const data = await getPost(id);
      setPost(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить пост');
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await getComments(id);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) {
      return;
    }

    try {
      await deletePost(id);
      navigate('/feed');
    } catch (err) {
      alert('Не удалось удалить пост');
      console.error('Error deleting post:', err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!commentContent.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      await createComment(id, commentContent);
      setCommentContent('');
      await loadComments();
    } catch (err) {
      alert('Не удалось добавить комментарий');
      console.error('Error creating comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentDeleted = () => {
    loadComments();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="post-page" data-easytag="id6-src/pages/PostPage/index.jsx">
        <div className="post-page-container">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-page" data-easytag="id6-src/pages/PostPage/index.jsx">
        <div className="post-page-container">
          <div className="error">{error || 'Пост не найден'}</div>
          <button onClick={() => navigate('/feed')} className="back-button">
            Назад к ленте
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = user && post.author && user.id === post.author.id;

  return (
    <div className="post-page" data-easytag="id6-src/pages/PostPage/index.jsx">
      <div className="post-page-container">
        <button onClick={() => navigate('/feed')} className="back-button">
          ← Назад к ленте
        </button>

        <div className="post-detail">
          <div className="post-header">
            <div className="post-author-info">
              <div className="author-name">{post.author?.username || 'Неизвестный пользователь'}</div>
              <div className="post-date">{formatDate(post.created_at)}</div>
            </div>
            {isAuthor && (
              <button onClick={handleDeletePost} className="delete-post-button">
                Удалить пост
              </button>
            )}
          </div>
          <div className="post-content">{post.content}</div>
        </div>

        <div className="comments-section">
          <h2 className="comments-title">Комментарии ({comments.length})</h2>

          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Напишите комментарий..."
              className="comment-input"
              rows="3"
              maxLength="2000"
              disabled={submitting}
            />
            <button 
              type="submit" 
              className="submit-comment-button"
              disabled={submitting || !commentContent.trim()}
            >
              {submitting ? 'Отправка...' : 'Добавить комментарий'}
            </button>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">Пока нет комментариев</div>
            ) : (
              comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id}
                  onDeleted={handleCommentDeleted}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
