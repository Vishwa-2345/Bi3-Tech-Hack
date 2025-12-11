import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadVideos = async (files) => {
  const formData = new FormData();
  
  formData.append('north', files.north);
  formData.append('south', files.south);
  formData.append('east', files.east);
  formData.append('west', files.west);

  try {
    const response = await axios.post(`${API_URL}/api/upload-videos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const getSimulationStatus = async () => {
  try {
    const response = await api.get('/api/simulation/status');
    return response.data;
  } catch (error) {
    console.error('Status error:', error);
    throw error;
  }
};

export default api;
