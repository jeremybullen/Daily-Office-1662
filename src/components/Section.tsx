import { ReactNode } from 'react';

interface SectionProps {
  title?: ReactNode;
  rubric?: ReactNode;
  metadata?: ReactNode;
  leftAction?: ReactNode;
  children: ReactNode;
  className?: string;
  onTitleClick?: () => void;
}

export function Section({ title, rubric, metadata, leftAction, children, className = '', onTitleClick }: SectionProps) {
  return (
    <div className={`flex flex-col md:flex-row gap-2 md:gap-12 mb-12 md:mb-16 ${className}`}>
      <div className="md:w-1/4 md:text-right md:shrink-0 md:pt-1.5 mb-4 md:mb-0">
        {title && (
          <h3 
            className={`font-semibold text-xs md:text-sm uppercase tracking-widest opacity-80 mb-2 ${onTitleClick ? 'cursor-pointer hover:opacity-100 underline decoration-dotted underline-offset-4' : ''}`}
            onClick={onTitleClick}
          >
            {title}
          </h3>
        )}
        {metadata && (
          <div className="text-xs md:text-sm opacity-60 font-serif mb-2 italic">
            {typeof metadata === 'string' && metadata.trim().endsWith('.') ? metadata.trim().slice(0, -1) : metadata}
          </div>
        )}
        {rubric && (
          <div className="rubric text-sm space-y-2 opacity-90">
            {typeof rubric === 'string' && !rubric.trim().endsWith('.') ? rubric.trim() + '.' : rubric}
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
