import React, { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

const SuccessModal = ({ title = "Berhasil", message, onClose, autoCloseMs }) => {
  useEffect(() => {
    if (!autoCloseMs) return;
    const timer = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(timer);
  }, [autoCloseMs, onClose]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
        {message && <p className="text-xs text-slate-500 mb-5">{message}</p>}

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;