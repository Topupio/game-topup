"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { RiSunLine, RiMoonLine } from "react-icons/ri";

export default function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="w-9 h-9" />;
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-secondary/50 hover:bg-slate-800/50 transition"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            {isDark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
        </button>
    );
}
