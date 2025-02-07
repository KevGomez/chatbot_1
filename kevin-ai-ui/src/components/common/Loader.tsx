import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: number;
  className?: string;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 18, className = '', text = 'Thinking...' }) => {
  return (
    <div className={`loading-text ${className}`}>
      <Loader2 className="animate-spin inline-block mr-2" size={size} />
      {text}
    </div>
  );
};

export default Loader; 