import { useEffect } from 'react';
import { X, BookOpen, BookText, CalendarDays } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sources = [
    { label: 'BCP', value: '1662', icon: BookOpen },
    { label: 'Bible', value: 'ESV', icon: BookText },
    { label: 'Lectionary', value: '1922', icon: CalendarDays },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-sm bg-[var(--bg-color)] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3 mb-5">
              <h2 id="about-title" className="text-xl font-bold tracking-tight font-serif">
                About
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors opacity-70 hover:opacity-100 shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sources List */}
            <div className="space-y-3 my-2">
              {sources.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 opacity-80 shrink-0">
                        <IconComponent size={18} />
                      </div>
                      <span className="font-serif font-semibold text-base sm:text-lg tracking-wide">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-serif font-bold text-base sm:text-lg tracking-wide px-3 py-1 rounded-lg bg-black/5 dark:bg-white/10">
                      <span>{item.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full font-semibold text-xs sm:text-sm bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
