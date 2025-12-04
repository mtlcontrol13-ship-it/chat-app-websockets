import { useState, useEffect, useCallback } from "react";

export const useTheme = () => {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        const theme = isDark ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [isDark]);

    const toggleTheme = useCallback(() => {
        setIsDark((prev) => !prev);
    }, []);

    return { isDark, toggleTheme };
};
