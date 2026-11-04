"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
type Theme = "light" | "dark";
const ThemeContext = createContext<{theme:Theme;setTheme:(theme:Theme)=>void}>({theme:"light",setTheme:()=>{}});
export function StoreTheme({children,initialTheme}:{children:ReactNode;initialTheme:Theme}) {
 const [theme,setThemeState]=useState<Theme>(initialTheme);
 const setTheme=(next:Theme)=>{setThemeState(next);document.cookie="topupioTheme="+next+"; Path=/; Max-Age=31536000; SameSite=Lax"+(location.protocol==="https:"?"; Secure":"");};
 useEffect(()=>{document.documentElement.style.colorScheme=theme;return()=>{document.documentElement.style.colorScheme="";};},[theme]);
 return <ThemeContext.Provider value={{theme,setTheme}}><div className="topupio-store min-h-screen" data-theme={theme}>{children}</div></ThemeContext.Provider>;
}
export function ThemeToggle(){const {theme,setTheme}=useContext(ThemeContext);return <div className="theme-toggle" role="group" aria-label="Colour theme">{(["light","dark"] as const).map(mode=><button key={mode} type="button" aria-label={mode==="light"?"Use light theme":"Use dark theme"} aria-pressed={theme===mode} title={mode==="light"?"Light theme":"Dark theme"} onClick={()=>setTheme(mode)}>{mode==="light"?<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20.8 13.1A9 9 0 0 1 10.9 3.2 9 9 0 1 0 20.8 13.1Z"/></svg>}</button>)}</div>;}
