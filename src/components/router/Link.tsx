import React, { memo } from 'react';
import { useRouter } from './index';

interface LinkProps {
  to: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const LinkComponent = ({ to, className, children, onClick }: LinkProps) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent default anchor behavior
    e.preventDefault();

    // Call custom onClick if provided
    if (onClick) {
      onClick();
    }

    // Navigate to the path
    navigate(to);
  };

  return (
    <a
      href={to}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

export const Link = memo(LinkComponent);
Link.displayName = 'Link';
