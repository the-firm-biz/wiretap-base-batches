import React, { HTMLAttributes } from 'react';

interface Props {
  children?: React.ReactNode;
  className?: HTMLAttributes<HTMLDivElement>['className'];
}

const AnimatedEllipsisText: React.FC<Props> = ({ className, children }) => {
  return (
    <div className={className}>
      {children}
      <span className="inline-block overflow-hidden align-bottom">
        <span className="animate-ellipsis1">.</span>
        <span className="animate-ellipsis2">.</span>
        <span className="animate-ellipsis3">.</span>
      </span>
    </div>
  );
};

export default AnimatedEllipsisText;
