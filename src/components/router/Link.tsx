import { ReactNode } from 'react';
import { useRouter } from '../Router';

interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

export const Link = ({ to, children, className }: LinkProps) => {
  const { navigateTo } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Map paths to page types
    let page: 'landing' | 'admin' | 'all-events' | 'login' = 'landing';

    if (to === '/admin') {
      page = 'admin';
    } else if (to === '/login') {
      page = 'login';
    } else if (to === '/events') {
      page = 'all-events';
    } else if (to === '/') {
      page = 'landing';
    }

    navigateTo(page);
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};