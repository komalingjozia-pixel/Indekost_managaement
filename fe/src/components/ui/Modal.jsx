import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Button from './Button.jsx';

function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 flex w-full max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${sizeClass[size]}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h3 className="text-lg font-semibold text-[#1E293B]">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Tutup">
            <FiX className="text-lg" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>

        {footer && (
          <div className="sticky bottom-0 z-10 shrink-0 border-t border-slate-100 bg-white px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
