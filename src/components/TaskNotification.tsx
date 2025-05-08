import React, { useEffect, useState } from 'react';

interface TaskNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function TaskNotification({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}: TaskNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  // Styling berdasarkan tipe notifikasi
  const getBgColor = () => {
    switch (type) {
      case 'success': 
        return 'bg-green-500/20 border-green-500';
      case 'error': 
        return 'bg-red-500/20 border-red-500';
      case 'info': 
        return 'bg-blue-500/20 border-blue-500';
      default: 
        return 'bg-gray-500/20 border-gray-500';
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success': 
        return '✅';
      case 'error': 
        return '❌';
      case 'info': 
        return 'ℹ️';
      default: 
        return '📢';
    }
  };

  return (
    <div className={`fixed bottom-20 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${getBgColor()} border rounded-lg px-4 py-3 shadow-lg max-w-sm`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-lg">{getIcon()}</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{message}</p>
          </div>
          <button 
            onClick={() => {
              setIsVisible(false);
              if (onClose) onClose();
            }}
            className="ml-auto -mx-1.5 -my-1.5 text-white p-1.5 rounded-lg hover:bg-white/10 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
