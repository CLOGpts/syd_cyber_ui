import React, { useState, useEffect, useCallback } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  onResizeEnd?: () => void;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onResize,
  onResizeEnd,
  orientation = 'vertical',
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      onResize(delta);
      setStartX(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      onResizeEnd?.();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, onResize, onResizeEnd]);

  return (
    <div
      className={`
        group relative z-30
        ${orientation === 'vertical' ? 'w-1 h-full' : 'h-1 w-full'}
        hover:bg-sky-500/50
        ${isDragging ? 'bg-sky-500/50' : 'bg-transparent'}
        cursor-col-resize
        transition-colors duration-200
        ${className}
      `}
      onMouseDown={handleMouseDown}
    >
      {/* Zona di cattura più ampia per facilità d'uso */}
      <div
        className={`
          absolute
          ${orientation === 'vertical'
            ? 'inset-y-0 -inset-x-1'
            : 'inset-x-0 -inset-y-1'
          }
        `}
      />

      {/* Indicatore visivo al centro */}
      <div
        className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          opacity-0 group-hover:opacity-100
          ${isDragging ? 'opacity-100' : ''}
          transition-opacity duration-200
          pointer-events-none
        `}
      >
        <GripVertical
          size={16}
          className="text-sky-500"
        />
      </div>
    </div>
  );
};

export default ResizeHandle;