import React, { useState, useEffect } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  style?: React.CSSProperties;
}

export default function ProgressiveImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  referrerPolicy = 'no-referrer',
  style
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset loading state when src changes (e.g., in gallery modal)
  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden w-full h-full ${containerClassName}`} style={style}>
      {/* Premium Luxury Skeleton / Ambient Glow Shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse flex items-center justify-center">
          {/* Subtle elegant glowing accent within the skeleton */}
          <div className="w-12 h-12 rounded-full border border-amber-500/10 bg-amber-500/[0.02] flex items-center justify-center animate-ping duration-1000">
            <div className="w-2 h-2 rounded-full bg-amber-400/20" />
          </div>
        </div>
      )}

      {/* Actual Image with smooth transition once loaded */}
      <img
        referrerPolicy={referrerPolicy}
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`transition-opacity duration-1000 ease-in-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
}
