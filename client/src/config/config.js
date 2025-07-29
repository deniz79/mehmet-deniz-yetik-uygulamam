const config = {
  // API URL - Production'da domain, development'ta localhost
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  
  // Socket URL - Production'da domain, development'ta localhost
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001',
  
  // App name
  APP_NAME: 'Yazışma',
  
  // Version
  VERSION: '1.0.0',
  
  // Default settings
  DEFAULT_AVATAR: '/default-avatar.png',
  MAX_MESSAGE_LENGTH: 1000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

export default config; 