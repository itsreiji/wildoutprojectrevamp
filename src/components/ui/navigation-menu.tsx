import React from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { cn } from '../ui/utils';
import { Link, LinkProps } from 'react-router-dom';

const NavigationMenuItem = ({
  children,
  className,
  ...props
}: NavigationMenu.NavigationMenuItemProps) => (
  <NavigationMenu.Item className={cn(className)} {...props}>
    {children}
  </NavigationMenu.Item>
);

const NavigationMenuList = ({
  children,
  className,
  ...props
}: NavigationMenu.NavigationMenuListProps) => (
  <NavigationMenu.List
    className={cn(
      'group flex flex-1 list-none items-center justify-center gap-x-1',
      className
    )}
    {...props}
  >
    {children}
  </NavigationMenu.List>
);

type NavigationMenuLinkProps = LinkProps & {
  className?: string;
  children: React.ReactNode;
};

const NavigationMenuLink = ({
  children,
  className,
  to,
  onClick,
  ...props
}: NavigationMenuLinkProps) => {
  return (
    <Link
      to={to || '#'}
      className={cn(
        'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export {
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  NavigationMenu,
};