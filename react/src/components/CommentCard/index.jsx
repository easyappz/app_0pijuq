import React from 'react';
import { deleteComment } from '../../api/comments';
import './styles.css';

const CommentCard = ({ comment, currentUserId, onDeleted }) => {
  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }

    try {
      await deleteComment(comment.id);
      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      alert('Не удалось удалить комментарий');
      console.error('Error deleting comment:', err);
    }
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

  const isAuthor = currentUserId && comment.author && currentUserId === comment.author.id;

  return (
    <div className="comment-card" data-easytag="id7-src/components/CommentCard/index.jsx">
      <div className="comment-header">
        <div className="comment-author-info">
          <div className="comment-author-name">
            {comment.author?.username || 'Неизвестный пользователь'}
          </div>
          <div className="comment-date">{formatDate(comment.created_at)}</div>
        </div>
        {isAuthor && (
          <button onClick={handleDelete} className="delete-comment-button">
            Удалить
          </button>
        )}
      </div>
      <div className="comment-content">{comment.content}</div>
    </div>
  );
};

export default CommentCard;
