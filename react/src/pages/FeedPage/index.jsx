import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts, createPost } from '../../api/posts';
import PostCard from '../../components/PostCard';
import Layout from '../../components/Layout';
import './styles.css';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, [page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPosts({ page, page_size: 10 });
      
      if (page === 1) {
        setPosts(data.results);
      } else {
        setPosts(prev => [...prev, ...data.results]);
      }
      
      setTotalCount(data.count);
      setHasMore(data.next !== null);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки постов');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Введите содержимое поста');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newPost = await createPost({ content });
      setPosts([newPost, ...posts]);
      setContent('');
      setTotalCount(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка создания поста');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <Layout>
      <div className="feed-page" data-easytag="id4-react/src/pages/FeedPage/index.jsx">
        <div className="feed-container">
          <header className="feed-header">
            <h1>Лента новостей</h1>
            <p className="feed-count">Всего постов: {totalCount}</p>
          </header>

          <form className="create-post-form" onSubmit={handleCreatePost}>
            <h2>Создать новый пост</h2>
            <textarea
              className="post-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Поделитесь своими мыслями..."
              rows="4"
              maxLength="5000"
              disabled={loading}
            />
            <div className="form-footer">
              <span className="char-count">{content.length} / 5000</span>
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading || !content.trim()}
              >
                {loading ? 'Публикация...' : 'Опубликовать'}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="posts-list">
            {posts.length === 0 && !loading && (
              <div className="empty-state">
                <p>Пока нет постов. Создайте первый!</p>
              </div>
            )}

            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onClick={() => handlePostClick(post.id)}
              />
            ))}

            {loading && page === 1 && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Загрузка постов...</p>
              </div>
            )}

            {hasMore && posts.length > 0 && (
              <button 
                className="load-more-button"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Загрузка...' : 'Загрузить ещё'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeedPage;