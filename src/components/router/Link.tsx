import React, { memo } from 'react';
import { useRouter } from './RouterContext';

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
      className={className}
      href={to}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

export const Link = memo(LinkComponent);
Link.displayName = 'Link';
