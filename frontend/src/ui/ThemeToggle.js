import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
function getInitialTheme() {
    const stored = localStorage.getItem("theme");
    return stored === "light" ? "light" : "dark";
}
export default function ThemeToggle() {
    const [theme, setTheme] = useState(getInitialTheme);
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);
    return (_jsx("button", { type: "button", onClick: () => setTheme((t) => (t === "dark" ? "light" : "dark")), "aria-label": theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre", title: theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre", className: "cursor-pointer rounded-md border border-edge bg-transparent px-3 py-2 text-sm text-ink", children: theme === "dark" ? "☀️" : "🌙" }));
}
