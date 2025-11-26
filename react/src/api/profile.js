import instance from './axios';

/**
 * Get user profile by ID
 * @param {number} id - User ID
 * @returns {Promise} User profile data
 */
export const getProfile = async (id) => {
  const response = await instance.get(`/api/profile/${id}/`);
  return response.data;
};

/**
 * Update own profile
 * @param {Object} data - Profile data
 * @param {string} data.bio - User bio
 * @returns {Promise} Updated profile data
 */
export const updateProfile = async (data) => {
  const response = await instance.patch('/api/profile/', data);
  return response.data;
};

/**
 * Get posts by user ID
 * @param {number} id - User ID
 * @returns {Promise} Array of user posts
 */
export const getProfilePosts = async (id) => {
  const response = await instance.get(`/api/profile/${id}/posts/`);
  return response.data;
};
