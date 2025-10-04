// API Configuration for different environments
const getApiBaseUrl = () => {
  // Check if we're running in development mode
  const isDevelopment = import.meta.env.DEV;
  
  // If accessed via IP address (mobile devices), use the network IP
  const currentHost = window.location.hostname;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // Local development
    return 'http://localhost:5001/api';
  } else {
    // Network access (mobile devices)
    return `http://192.168.10.124:5001/api`;
  }
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  HEALTH_URL: getApiBaseUrl().replace('/api', '/health')
};