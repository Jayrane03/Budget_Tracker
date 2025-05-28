// Load environment variables with fallback defaults
const BASE_URL = import.meta.env.VITE_BASE_URL ?? "http://localhost:5000";
const PYTHON_SERVER_URL = import.meta.env.VITE_PYTHON_URL ?? "http://localhost:5001";

// Export as default so you can import it as `helper`
const config = {
  BASE_URL,
  PYTHON_SERVER_URL,
};

export default config;
