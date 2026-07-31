import React from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmModal = ({ open, title, message, onCancel, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center">
        {/* Container ikon dibuat lebih ringkas dan proporsional */}
        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <h3 className="text-sm font-bold text-slate-800">{title}</h3>

        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            onClick={onCancel}
            className="w-1/2 py-2 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            className="w-1/2 py-2 px-3 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
