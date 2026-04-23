import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const Icon = isDanger ? Trash2 : AlertTriangle;
  const iconBg = isDanger ? 'bg-red-500/15' : 'bg-yellow-500/15';
  const iconColor = isDanger ? 'text-red-400' : 'text-yellow-400';
  const confirmBg = isDanger
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-yellow-500 hover:bg-yellow-600 text-black';

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-[#27272a] bg-[#111111] shadow-2xl animate-slide-up">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-primary-500 transition-colors hover:bg-[#27272a] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>

          {/* Content */}
          <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm leading-relaxed text-primary-400">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#27272a] bg-[#09090b] px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-xl border border-[#27272a] bg-[#111111] px-4 py-2 text-sm font-semibold text-primary-200 transition-colors hover:bg-[#1d1d20] hover:text-white"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
