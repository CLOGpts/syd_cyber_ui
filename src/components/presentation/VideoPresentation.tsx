import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Volume2, VolumeX, Maximize2, Minimize2, PlayCircle } from 'lucide-react';

interface VideoPresentationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const VideoPresentation: React.FC<VideoPresentationProps> = ({ isOpen: propIsOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(propIsOpen || false);

  // Sync con prop esterna
  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen);
    }
  }, [propIsOpen]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isOpen]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
    setIsPlaying(false);
    setProgress(0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedValue = (x / rect.width) * videoRef.current.duration;
      videoRef.current.currentTime = clickedValue;
    }
  };

  return (
    <>
      {/* Rimuoviamo il bottone floating - ora è nella sidebar */}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Video Container */}
          <div 
            ref={containerRef}
            className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 to-gray-800 
                       rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 
                          bg-gradient-to-b from-black/70 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="text-white font-semibold text-lg">
                    SYD - Il tuo consulente digitale
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 
                           rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video */}
            <video
              ref={videoRef}
              src="/avatar-presentation.mp4"
              className="w-full aspect-video bg-black"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-10 
                          bg-gradient-to-t from-black/70 to-transparent p-4">
              {/* Progress Bar */}
              <div 
                className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 
                           rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 text-white hover:bg-white/20 rounded-lg 
                             transition-all duration-200"
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleMute}
                    className="p-2 text-white hover:bg-white/20 rounded-lg 
                             transition-all duration-200"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  onClick={handleFullscreen}
                  className="p-2 text-white hover:bg-white/20 rounded-lg 
                           transition-all duration-200"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-purple-500/20 
                          rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-blue-500/20 
                          rounded-full blur-xl animate-pulse delay-1000" />
          </div>
        </div>
      )}
    </>
  );
};