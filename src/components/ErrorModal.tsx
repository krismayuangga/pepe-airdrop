import { useState, useEffect } from 'react';

interface ErrorModalProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ErrorModal({ message, isOpen, onClose }: ErrorModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  if (!isOpen && !isVisible) return null;
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div 
        className={`bg-[#14192E] border border-red-500 rounded-xl shadow-lg max-w-md w-full p-6 relative transform transition-all duration-300 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-white">Error</h3>
            <p className="mt-2 text-sm text-gray-300">{message}</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
