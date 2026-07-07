import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
export default function Modal({ title, onClose, children }) {
    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape")
                onClose();
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4", onClick: onClose, children: _jsxs("div", { className: "max-h-[85vh] w-[min(480px,92vw)] overflow-y-auto rounded-xl bg-card p-6 shadow-overlay", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "m-0 text-lg font-bold", children: title }), _jsx("button", { type: "button", onClick: onClose, "aria-label": "Fermer", className: "cursor-pointer rounded-md border border-edge bg-transparent px-2 py-1 text-ink", children: "\u2715" })] }), children] }) }));
}
