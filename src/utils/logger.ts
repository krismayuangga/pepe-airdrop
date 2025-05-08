// Simple logger utility for debugging
const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${message}`, data ? data : '');
    }
  },
  
  info: (message: string, data?: any) => {
    console.info(`[INFO] ${message}`, data ? data : '');
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error ? error : '');
    
    // In development, we might want to display more details
    if (process.env.NODE_ENV !== 'production' && error) {
      console.error('Error details:', error);
    }
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data ? data : '');
  },
  
  // Log to both console and return a formatted string (useful for UI display)
  formatError: (message: string, error?: any): string => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = `${message}: ${errorMessage}`;
    console.error(fullMessage);
    return fullMessage;
  }
};

export default logger;
