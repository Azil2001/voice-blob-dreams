
import React from 'react';

interface AnimatedBlobProps {
  isListening: boolean;
}

const AnimatedBlob: React.FC<AnimatedBlobProps> = ({ isListening }) => {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 my-8">
      <div
        className={`absolute inset-0 ${isListening ? 'pulsating-blob' : 'animated-blob'}`}
      />
    </div>
  );
};

export default AnimatedBlob;
