// services/helper.js

// Determine if we are in a production environment
// Vite automatically exposes NODE_ENV through import.meta.env
// In development, import.meta.env.MODE is 'development'
// In production, import.meta.env.MODE is 'production'
const isProduction = import.meta.env.MODE === 'production';

let BASE_URL;
let PYTHON_SERVER_URL;

if (isProduction) {
    // In production, use the URLs from the .env.production file
    BASE_URL = import.meta.env.VITE_BASE_URL;
    PYTHON_SERVER_URL = import.meta.env.VITE_PYTHON_URL;
} else {
    // In development, use local URLs
    BASE_URL = "http://localhost:5000";
    PYTHON_SERVER_URL = "http://localhost:5001";
}

// You can add a fallback for VITE_BASE_URL/VITE_PYTHON_URL if they might be undefined
// in some edge cases or build environments, but Vite usually handles this well.
// For now, assuming they are defined in production environment files.
// Example:
// BASE_URL = import.meta.env.VITE_BASE_URL || "fallback-production-url.com";


const config = {
    BASE_URL,
    PYTHON_SERVER_URL,
};

export default config;