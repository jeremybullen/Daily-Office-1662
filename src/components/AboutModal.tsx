import { useEffect } from 'react';
import { X, BookOpen, BookText, CalendarDays, ExternalLink } from 'lucide-react';
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
    {
      label: 'BCP',
      value: '1662',
      icon: BookOpen,
      url: 'https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/book-common-prayer/order-morning-prayer',
    },
    {
      label: 'Lectionary',
      value: '1662',
      icon: CalendarDays,
      url: 'https://www.ivpress.com/Media/Default/Content-Articles/1662-daily-office-lectionary.pdf',
    },
    {
      label: 'Bible',
      value: 'ESV',
      icon: BookText,
      url: 'https://www.esv.org',
    },
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
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all cursor-pointer"
                    title={`Open ${item.label} (${item.value}) in new tab`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                        <IconComponent size={18} />
                      </div>
                      <span className="font-serif font-semibold text-base sm:text-lg tracking-wide group-hover:underline">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-serif font-bold text-base sm:text-lg tracking-wide px-3 py-1 rounded-lg bg-black/5 dark:bg-white/10 group-hover:bg-black/10 dark:group-hover:bg-white/20 transition-colors">
                      <span>{item.value}</span>
                      <ExternalLink size={13} className="opacity-50 group-hover:opacity-100 transition-opacity ml-0.5" />
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Copyright & Licensing Attribution */}
            <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 text-[11px] leading-relaxed opacity-65 font-sans">
              <p>
                Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.
              </p>
            </div>

            {/* Close Button */}
            <div className="mt-5 flex justify-end">
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
