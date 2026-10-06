import axios from 'axios';

// Railway backend URL — used in production on Vercel
const RAILWAY_URL = 'https://disciplined-youth-production-9629.up.railway.app';

// Use VITE_API_URL env var if set, otherwise use hardcoded Railway URL
// Falls back to /api only in local development (when running vite dev)
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : import.meta.env.DEV
    ? '/api'
    : `${RAILWAY_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export const getHealthStatus = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const predictCoconutImage = async (file, opacity = 0.45, threshold = 0.40, colormap = 'jet') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('opacity', opacity);
  formData.append('threshold', threshold);
  formData.append('colormap', colormap);

  const response = await api.post('/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const predictBatchImages = async (files, opacity = 0.45, threshold = 0.40, colormap = 'jet') => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  formData.append('opacity', opacity);
  formData.append('threshold', threshold);
  formData.append('colormap', colormap);

  const response = await api.post('/predict/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateGradCAM = async (file, rawScore, opacity, threshold, colormap) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('raw_score', rawScore);
  formData.append('opacity', opacity);
  formData.append('threshold', threshold);
  formData.append('colormap', colormap);

  const response = await api.post('/gradcam', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getPredictionHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const downloadHistoryCSV = () => {
  window.open(`${API_BASE_URL}/history/download`, '_blank');
};

export const downloadHistoryExcel = () => {
  window.open(`${API_BASE_URL}/history/excel`, '_blank');
};

export const downloadPredictionPDF = (id, filename, prediction, confidence, qualityScore, grade, gradeLabel) => {
  const params = new URLSearchParams({
    id: id || 1,
    filename: filename || 'sample.jpg',
    prediction: prediction || 'HEALTHY',
    confidence: confidence || 95.0,
    quality_score: qualityScore || 85.0,
    quality_grade: grade || 'A',
    quality_grade_label: gradeLabel || 'High Quality'
  });
  window.open(`${API_BASE_URL}/reports/prediction/pdf?${params.toString()}`, '_blank');
};

export const downloadBatchPDF = async (batchSummary) => {
  const response = await api.post('/reports/batch/pdf', batchSummary, {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `batch_report_${Date.now()}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadBatchExcel = async (batchSummary) => {
  const response = await api.post('/history/batch/excel', batchSummary, {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `batch_results_${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const clearPredictionHistory = async () => {
  const response = await api.delete('/history/clear');
  return response.data;
};

export const getAnalyticsSummary = async (timeRange = 'all') => {
  const response = await api.get(`/analytics?time_range=${timeRange}`);
  return response.data;
};

export const getFungalAlerts = async () => {
  const response = await api.get('/notifications/alerts');
  return response.data;
};

export const getModelComparison = async () => {
  const response = await api.get('/model-comparison');
  return response.data;
};

export const getModelInfo = async () => {
  const response = await api.get('/model-info');
  return response.data;
};

export default api;
