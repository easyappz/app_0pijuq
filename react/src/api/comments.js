import instance from './axios';

export const getComments = async (postId) => {
  const response = await instance.get(`/api/posts/${postId}/comments/`);
  return response.data;
};

export const createComment = async (postId, content) => {
  const response = await instance.post(`/api/posts/${postId}/comments/`, { content });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await instance.delete(`/api/comments/${commentId}/`);
  return response.data;
};
