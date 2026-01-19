"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface ScrollRevealImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
}

const ScrollRevealImage = ({ src, alt, className, fill }: ScrollRevealImageProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false); // Reset to grayscale when out of view
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of the image is visible
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current);
    };
  }, []);

  return (
    <div ref={imgRef} className={`relative w-full h-full overflow-hidden transition-all duration-[2000ms] ease-in-out ${isVisible ? 'grayscale-0' : 'grayscale'} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className="object-cover object-top"
      />
    </div>
  );
};

export default ScrollRevealImage;
