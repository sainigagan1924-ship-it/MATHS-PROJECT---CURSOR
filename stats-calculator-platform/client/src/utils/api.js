import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export async function calculateTest(testId, body) {
  const { data } = await api.post(`/api/calculate/${testId}`, body);
  return data;
}

export async function fetchSaved(limit = 30) {
  const { data } = await api.get('/api/saved', { params: { limit } });
  return data;
}

export async function saveCalculation(payload) {
  const { data } = await api.post('/api/saved', payload);
  return data;
}

export async function deleteSaved(id) {
  const { data } = await api.delete(`/api/saved/${id}`);
  return data;
}

export async function fetchShare(token) {
  const { data } = await api.get(`/api/saved/share/${token}`);
  return data;
}
