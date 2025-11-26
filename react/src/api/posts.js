import instance from './axios';

/**
 * Get paginated list of posts
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.page_size - Number of items per page
 * @returns {Promise} Paginated posts data
 */
export const getPosts = async (params = {}) => {
  const response = await instance.get('/api/posts/', { params });
  return response.data;
};

/**
 * Create a new post
 * @param {Object} data - Post data
 * @param {string} data.content - Post content
 * @returns {Promise} Created post data
 */
export const createPost = async (data) => {
  const response = await instance.post('/api/posts/', data);
  return response.data;
};

/**
 * Get single post by ID
 * @param {number} id - Post ID
 * @returns {Promise} Post data
 */
export const getPost = async (id) => {
  const response = await instance.get(`/api/posts/${id}/`);
  return response.data;
};

/**
 * Delete a post
 * @param {number} id - Post ID
 * @returns {Promise} Delete confirmation
 */
export const deletePost = async (id) => {
  const response = await instance.delete(`/api/posts/${id}/`);
  return response.data;
};
