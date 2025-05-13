import React, { useEffect, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number; // ms per character
  emphasisClass?: string;
  emphasisStart?: number; // index at which to start emphasis
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text = '',
  className,
  speed = 30,
  emphasisClass,
  emphasisStart
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (!text) return;
    const interval = setInterval(() => {
      setIndex((i) => {
        if (i < text.length) {
          return i + 1;
        } else {
          clearInterval(interval);
          return i;
        }
      });
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  // If emphasis is not needed, just render the whole string
  if (!emphasisClass || emphasisStart == null || emphasisStart > index) {
    return (
      <span className={className} style={{ whiteSpace: 'pre-line' }}>
        {text.slice(0, index)}
      </span>
    );
  }

  // Otherwise, split the string and apply emphasisClass to the second part
  return (
    <span style={{ whiteSpace: 'pre-line' }}>
      <span className={className}>{text.slice(0, emphasisStart)}</span>
      <span className={emphasisClass}>{text.slice(emphasisStart, index)}</span>
    </span>
  );
};
