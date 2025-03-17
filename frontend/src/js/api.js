import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터 설정
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 설정
api.interceptors.response.use(
  response => response,
  error => {
    // 401 에러 처리 (인증 만료)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
    }
    return Promise.reject(error);
  }
);

// API 함수들 구현
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export const projectAPI = {
  getProjects: () => api.get('/projects'),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  addMember: (projectId, memberId, role) => api.post(`/projects/${projectId}/members`, { memberId, role }),
  removeMember: (projectId, memberId) => api.delete(`/projects/${projectId}/members/${memberId}`),
};

export const riskAssessmentAPI = {
  getAssessments: (projectId) => api.get(`/projects/${projectId}/risk-assessments`),
  getAssessmentById: (id) => api.get(`/risk-assessment/${id}`),
  createAssessment: (projectId, data) => api.post(`/projects/${projectId}/risk-assessments`, data),
  updateAssessment: (id, data) => api.put(`/risk-assessment/${id}`, data),
  deleteAssessment: (id) => api.delete(`/risk-assessment/${id}`),
  updateFactor: (assessmentId, factorId, data) => api.put(`/risk-assessment/${assessmentId}/factors/${factorId}`, data),
  generatePdf: (id) => api.get(`/risk-assessment/${id}/pdf`, { responseType: 'blob' }),
};

export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/query', { message }),
  provideFeedback: (messageId, feedback) => api.post('/chatbot/feedback', { messageId, feedback }),
  getHistory: () => api.get('/chatbot/history'),
};

export const documentAPI = {
  getDocuments: (filters) => api.get('/safety-docs', { params: filters }),
  uploadDocument: (formData) => api.post('/safety-docs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  }),
  getDocumentById: (id) => api.get(`/safety-docs/${id}`),
  updateDocument: (id, data) => api.put(`/safety-docs/${id}`, data),
  deleteDocument: (id) => api.delete(`/safety-docs/${id}`),
  downloadDocument: (id) => api.get(`/safety-docs/${id}/download`, { responseType: 'blob' }),
};

export const workerAPI = {
  getWorkers: (filters) => api.get('/workers', { params: filters }),
  getWorkerById: (id) => api.get(`/workers/${id}`),
  createWorker: (data) => api.post('/workers', data),
  updateWorker: (id, data) => api.put(`/workers/${id}`, data),
  deleteWorker: (id) => api.delete(`/workers/${id}`),
  recordCheckin: (id, type) => api.post(`/workers/${id}/checkin`, { type }),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export const communityAPI = {
  getPosts: (filters) => api.get('/community/posts', { params: filters }),
  getPostById: (id) => api.get(`/community/posts/${id}`),
  createPost: (data) => api.post('/community/posts', data),
  updatePost: (id, data) => api.put(`/community/posts/${id}`, data),
  deletePost: (id) => api.delete(`/community/posts/${id}`),
  addComment: (postId, content) => api.post(`/community/posts/${postId}/comments`, { content }),
  deleteComment: (postId, commentId) => api.delete(`/community/posts/${postId}/comments/${commentId}`),
};

export default api; 