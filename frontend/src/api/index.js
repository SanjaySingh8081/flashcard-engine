import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const decksAPI = {
  getAll: () => api.get('/decks'),
  getOne: (id) => api.get(`/decks/${id}`),
  create: (data) => api.post('/decks', data),
  update: (id, data) => api.put(`/decks/${id}`, data),
  delete: (id) => api.delete(`/decks/${id}`),
};

export const cardsAPI = {
  getAll: (deckId) => api.get(`/decks/${deckId}/cards`),
  create: (deckId, data) => api.post(`/decks/${deckId}/cards`, data),
  update: (deckId, cardId, data) => api.put(`/decks/${deckId}/cards/${cardId}`, data),
  delete: (deckId, cardId) => api.delete(`/decks/${deckId}/cards/${cardId}`),
};

export const studyAPI = {
  // fetchAll=true → ignore SM-2 schedule and return every card in the deck
  getCards: (deckId, fetchAll = false) =>
    api.get(`/decks/${deckId}/study${fetchAll ? '?all=true' : ''}`),
  submitReview: (deckId, cardId, quality) =>
    api.post(`/decks/${deckId}/study/${cardId}`, { quality }),
};

export default api;
