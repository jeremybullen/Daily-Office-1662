import { ReactNode } from 'react';

interface SectionProps {
  title?: ReactNode;
  rubric?: ReactNode;
  leftAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ title, rubric, leftAction, children, className = '' }: SectionProps) {
  return (
    <div className={`flex flex-col md:flex-row gap-2 md:gap-12 mb-12 md:mb-16 ${className}`}>
      <div className="md:w-1/4 md:text-right md:shrink-0 md:pt-1.5 mb-4 md:mb-0">
        {title && (
          <h3 className="font-semibold text-xs md:text-sm uppercase tracking-widest opacity-80 mb-2">
            {title}
          </h3>
        )}
        {rubric && (
          <div className="rubric text-sm space-y-2 opacity-90">
            {rubric}
          </div>
        )}
        {leftAction && (
          <div className="mt-3 md:mt-4 flex md:justify-end">
            {leftAction}
          </div>
        )}
      </div>
      <div className="md:w-3/4 flex-1">
        {children}
      </div>
    </div>
  );
}
