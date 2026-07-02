const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel, cancelLabel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message}</p>
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-all"
                    >
                        {cancelLabel || "Cancel"}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                    >
                        {confirmLabel || "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;