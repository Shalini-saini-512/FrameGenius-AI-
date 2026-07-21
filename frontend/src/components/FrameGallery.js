


import React from 'react';
// import './FrameGallery.css';
// import axios from 'axios';
const FrameGallery = ({ data }) => {
  // Yahan tumhara component ka code...
  if (!data || data.length === 0) {
    return <div className="text-[#9888A8] p-4">No frames to display.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full p-4">
      {data.map((frame) => (
        <div 
          key={frame.id} 
          className="bg-[#FAF4ED] p-8 rounded-[30px] shadow-[8px_8px_16px_#C7B9E0,-8px_-8px_16px_#FFFFFF] transition-all duration-300 hover:scale-105 border-2 border-transparent"
        >
          <h3 className="font-bold text-[#6C5B7B] text-xl mb-2">
            {frame.name}
          </h3>
          <p className={`font-semibold text-sm ${frame.status === 'Processed' ? 'text-emerald-500' : 'text-amber-500'}`}>
            {frame.status}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FrameGallery;