import React, { ReactNode } from 'react';

export const processNode = (node: ReactNode): ReactNode => {
  return node;
};

export const P = ({ children, className = '', ...props }: React.ComponentProps<'p'>) => {
  return <p className={className} {...props}>{children}</p>;
};
