import instance from './axios';

/**
 * Get comments for a specific post
 * @param {number} postId - Post ID
 * @returns {Promise} Array of comments
 */
export const getComments = async (postId) => {
  const response = await instance.get(`/api/posts/${postId}/comments/`);
  return response.data;
};

/**
 * Create a new comment for a post
 * @param {number} postId - Post ID
 * @param {Object} data - Comment data
 * @param {string} data.content - Comment content
 * @returns {Promise} Created comment data
 */
export const createComment = async (postId, data) => {
  const response = await instance.post(`/api/posts/${postId}/comments/`, data);
  return response.data;
};

/**
 * Delete a comment
 * @param {number} id - Comment ID
 * @returns {Promise} Delete confirmation
 */
export const deleteComment = async (id) => {
  const response = await instance.delete(`/api/comments/${id}/`);
  return response.data;
};
