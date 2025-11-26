import instance from './axios';

/**
 * Register a new user
 * @param {Object} data - Registration data
 * @param {string} data.username - Username
 * @param {string} data.email - Email
 * @param {string} data.password - Password
 * @param {string} data.password_confirm - Password confirmation
 * @returns {Promise} User data
 */
export const register = async (data) => {
  const response = await instance.post('/api/auth/register/', data);
  return response.data;
};

/**
 * Login user
 * @param {Object} data - Login credentials
 * @param {string} data.username - Username
 * @param {string} data.password - Password
 * @returns {Promise} User data
 */
export const login = async (data) => {
  const response = await instance.post('/api/auth/login/', data);
  return response.data;
};

/**
 * Logout current user
 * @returns {Promise} Logout confirmation
 */
export const logout = async () => {
  const response = await instance.post('/api/auth/logout/');
  return response.data;
};

/**
 * Get current authenticated user
 * @returns {Promise} Current user data
 */
export const getMe = async () => {
  const response = await instance.get('/api/auth/me/');
  return response.data;
};
