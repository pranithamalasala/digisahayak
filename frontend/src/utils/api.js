import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// ── Courses ───────────────────────────────────────────────────
export const coursesAPI = {
  getAll: () => api.get("/courses/"),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post("/courses/", data),
  update: (id, data) => api.put(`/courses/${id}`, data),
};

// ── Lessons ───────────────────────────────────────────────────
export const lessonsAPI = {
  getOne: (id) => api.get(`/lessons/${id}`),
  complete: (id) => api.post(`/lessons/${id}/complete`),
  create: (data) => api.post("/lessons/", data),
};

// ── Quizzes ───────────────────────────────────────────────────
export const quizzesAPI = {
  getForCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
  submit: (data) => api.post("/quizzes/submit", data),
  getHistory: () => api.get("/quizzes/history"),
  addQuestion: (data) => api.post("/quizzes/question", data),
};

// ── Progress ──────────────────────────────────────────────────
export const progressAPI = {
  get: () => api.get("/progress/"),
};

// ── Certificates ──────────────────────────────────────────────
export const certificatesAPI = {
  getAll: () => api.get("/certificates/"),
  download: (id) =>
    api.get(`/certificates/${id}/download`, { responseType: "blob" }),
  verify: (certNumber) => api.get(`/certificates/verify/${certNumber}`),
};

// ── Community ─────────────────────────────────────────────────
export const communityAPI = {
  getPosts: (params) => api.get("/community/posts", { params }),
  getPost: (id) => api.get(`/community/posts/${id}`),
  createPost: (data) => api.post("/community/posts", data),
  addReply: (postId, data) => api.post(`/community/posts/${postId}/reply`, data),
  resolvePost: (id) => api.put(`/community/posts/${id}/resolve`),
  upvote: (id) => api.post(`/community/posts/${id}/upvote`),
};

// ── Workshops ─────────────────────────────────────────────────
export const workshopsAPI = {
  getAll: () => api.get("/workshops/"),
  register: (id) => api.post(`/workshops/${id}/register`),
  unregister: (id) => api.delete(`/workshops/${id}/unregister`),
  create: (data) => api.post("/workshops/", data),
};

// ── AI Assistant ──────────────────────────────────────────────
export const aiAPI = {
  chat: (data) => api.post("/ai/chat", data),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
};

export default api;
