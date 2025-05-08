// Polyfills untuk browser environment
if (typeof window !== 'undefined') {
  // Global object
  window.global = window;
}

// Buffer polyfill for browser
if (typeof window !== 'undefined') {
  // Assign window.global to window object
  window.global = window;
}

export {};
