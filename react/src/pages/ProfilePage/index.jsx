import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getProfilePosts } from '../../api/profile';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../../components/PostCard';
import Layout from '../../components/Layout';
import './styles.css';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bio, setBio] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const isOwnProfile = user && profile && user.id === profile.id;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfileData();
  }, [id, isAuthenticated]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileData = await getProfile(id);
      setProfile(profileData);
      setBio(profileData.bio || '');
      
      const postsData = await getProfilePosts(id);
      setPosts(postsData.results || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
    setUpdateError(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setBio(profile.bio || '');
    setUpdateError(null);
  };

  const handleUpdateBio = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      
      const updatedProfile = await updateProfile({ bio });
      setProfile(updatedProfile);
      setIsEditModalOpen(false);
    } catch (err) {
      setUpdateError(err.response?.data?.error || 'Ошибка обновления профиля');
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="profile-page" data-easytag="id8-react/src/pages/ProfilePage/index.jsx">
          <div className="profile-loading">
            <div className="spinner"></div>
            <p>Загрузка профиля...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="profile-page" data-easytag="id8-react/src/pages/ProfilePage/index.jsx">
          <div className="profile-error">
            <p>{error}</p>
            <button onClick={() => navigate('/feed')} className="back-button">
              Вернуться к ленте
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Layout>
      <div className="profile-page" data-easytag="id8-react/src/pages/ProfilePage/index.jsx">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-placeholder">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="profile-info">
              <div className="profile-username-row">
                <h1 className="profile-username">{profile.username}</h1>
                {isOwnProfile && (
                  <button 
                    className="edit-profile-button"
                    onClick={handleOpenEditModal}
                  >
                    Редактировать профиль
                  </button>
                )}
              </div>
              
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{profile.posts_count}</span>
                  <span className="stat-label">постов</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">На сайте с {formatDate(profile.created_at)}</span>
                </div>
              </div>
              
              {profile.bio && (
                <div className="profile-bio">
                  <p>{profile.bio}</p>
                </div>
              )}
            </div>
          </div>

          <div className="profile-posts-section">
            <h2 className="posts-section-title">Посты пользователя</h2>
            
            {posts.length === 0 ? (
              <div className="no-posts">
                <p>Пользователь пока не создал ни одного поста</p>
              </div>
            ) : (
              <div className="posts-list">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>

        {isEditModalOpen && (
          <div className="modal-overlay" onClick={handleCloseEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Редактировать профиль</h2>
                <button className="close-modal" onClick={handleCloseEditModal}>
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleUpdateBio} className="edit-form">
                <div className="form-group">
                  <label htmlFor="bio">Биография</label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Расскажите о себе..."
                    maxLength={500}
                    rows={5}
                    className="bio-textarea"
                  />
                  <div className="char-counter">
                    {bio.length}/500
                  </div>
                </div>
                
                {updateError && (
                  <div className="update-error">
                    {updateError}
                  </div>
                )}
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={handleCloseEditModal}
                    className="cancel-button"
                    disabled={updateLoading}
                  >
                    Отмена
                  </button>
                  <button 
                    type="submit" 
                    className="save-button"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;