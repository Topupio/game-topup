"use client";

import { useEffect, useState } from "react";
import {
    RiFlashlightFill,
    RiShieldCheckFill,
    RiTimeFill,
    RiStarFill,
    RiStarHalfFill,
} from "react-icons/ri";

interface HeroHeaderProps {
    imageUrl: string;
    title: string;
    subtitle?: string;
}

interface TrustpilotData {
    stars: number;
    trustScore: number;
    totalReviews: number;
}

const TRUSTPILOT_CACHE_KEY = "tp_cache";
const TRUSTPILOT_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const TRUSTPILOT_URL = "https://www.trustpilot.com/review/topupio.com";

/* Fetch live Trustpilot data via the widget endpoint (no API key required, CORS open) */
function useTrustpilotData() {
    const [data, setData] = useState<TrustpilotData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let settled = false;

        // Check localStorage cache first
        try {
            const cached = localStorage.getItem(TRUSTPILOT_CACHE_KEY);
            if (cached) {
                const { data: cachedData, ts } = JSON.parse(cached);
                if (Date.now() - ts < TRUSTPILOT_CACHE_TTL) {
                    setData(cachedData);
                    setIsLoading(false);
                    return;
                }
                // Cache is stale, but use it as intermediate value while we fetch
                setData(cachedData);
            }
        } catch { /* ignore parse errors */ }

        const controller = new AbortController();

        // Timeout: if fetch takes longer than 5s, stop waiting
        const timeout = setTimeout(() => {
            if (!settled) {
                settled = true;
                setIsLoading(false);
                controller.abort();
            }
        }, 5000);

        fetch(
            "https://widget.trustpilot.com/trustbox-data/56278e9abfbbba0bdcd568bc?businessUnitId=698846882706dd2e7b4401bf&locale=en-US",
            { signal: controller.signal }
        )
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((json) => {
                if (settled) return;
                settled = true;
                clearTimeout(timeout);

                const bu = json?.businessUnit;
                if (bu) {
                    const parsed: TrustpilotData = {
                        stars: bu.stars,
                        trustScore: bu.trustScore,
                        totalReviews: bu.numberOfReviews?.total ?? 0,
                    };
                    setData(parsed);
                    // Cache in localStorage
                    try {
                        localStorage.setItem(
                            TRUSTPILOT_CACHE_KEY,
                            JSON.stringify({ data: parsed, ts: Date.now() })
                        );
                    } catch { /* quota exceeded – ignore */ }
                }
                setIsLoading(false);
            })
            .catch(() => {
                if (settled) return;
                settled = true;
                clearTimeout(timeout);
                setIsLoading(false);
            });

        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, []);

    return { data, isLoading };
}

/* Trustpilot star boxes – replicates Trustpilot's signature style:
   each star sits inside a filled green square, matching the official look */
function TrustpilotStars({ rating }: { rating: number }) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const isFull = rating >= i;
        const isHalf = !isFull && rating >= i - 0.5;
        stars.push(
            <span
                key={i}
                className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-[3px] ${
                    isFull || isHalf ? "bg-[#00b67a]" : "bg-[#dcdce6]"
                }`}
            >
                {isHalf ? (
                    <RiStarHalfFill className="w-3 h-3 text-white" />
                ) : (
                    <RiStarFill className="w-3 h-3 text-white" />
                )}
            </span>
        );
    }
    return <div className="flex items-center gap-[2px]">{stars}</div>;
}

/* Official Trustpilot logo SVG – star + wordmark, clearly visible */
function TrustpilotLogo() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="20.5 248.5 600 147.3"
            className="h-5 w-auto shrink-0"
        >
            <path
                d="m178.2 300.7h60.7v11.3h-23.9v63.7h-13.1v-63.7h-23.8zm58.1 20.7h11.2v10.5h.2c.4-1.5 1.1-2.9 2.1-4.3s2.2-2.7 3.7-3.8c1.4-1.2 3-2.1 4.8-2.8 1.7-.7 3.5-1.1 5.3-1.1 1.4 0 2.4.1 2.9.1.5.1 1.1.2 1.6.2v11.5c-.8-.2-1.7-.3-2.6-.4s-1.7-.2-2.6-.2c-2 0-3.9.4-5.7 1.2s-3.3 2-4.7 3.5c-1.3 1.6-2.4 3.5-3.2 5.8s-1.2 5-1.2 8v25.8h-12zm86.8 54.3h-11.8v-7.6h-.2c-1.5 2.8-3.7 4.9-6.6 6.6s-5.9 2.5-8.9 2.5c-7.1 0-12.3-1.7-15.5-5.3-3.2-3.5-4.8-8.9-4.8-16v-34.5h12v33.3c0 4.8.9 8.2 2.8 10.1 1.8 2 4.4 3 7.7 3 2.5 0 4.6-.4 6.3-1.2s3.1-1.8 4.1-3.1c1.1-1.3 1.8-2.9 2.3-4.7s.7-3.8.7-5.9v-31.5h12v54.3zm20.4-17.4c.4 3.5 1.7 5.9 4 7.4 2.3 1.4 5.1 2.1 8.3 2.1 1.1 0 2.4-.1 3.8-.3s2.8-.5 4-1c1.3-.5 2.3-1.2 3.1-2.2s1.2-2.2 1.1-3.7-.6-2.8-1.7-3.8-2.4-1.7-4-2.4c-1.6-.6-3.5-1.1-5.6-1.5s-4.2-.9-6.4-1.4-4.4-1.1-6.5-1.8-3.9-1.6-5.6-2.9c-1.6-1.2-3-2.7-3.9-4.6-1-1.9-1.5-4.1-1.5-6.9 0-3 .7-5.4 2.2-7.4 1.4-2 3.3-3.6 5.5-4.8s4.7-2.1 7.4-2.6 5.3-.7 7.7-.7c2.8 0 5.5.3 8 .9s4.9 1.5 6.9 2.9c2.1 1.3 3.8 3.1 5.1 5.2 1.4 2.1 2.2 4.7 2.6 7.7h-12.5c-.6-2.9-1.9-4.8-3.9-5.8-2.1-1-4.4-1.5-7.1-1.5-.8 0-1.9.1-3 .2-1.2.2-2.2.4-3.3.8-1 .4-1.9 1-2.6 1.7s-1.1 1.7-1.1 2.9c0 1.5.5 2.6 1.5 3.5s2.3 1.6 4 2.3c1.6.6 3.5 1.1 5.6 1.5s4.3.9 6.5 1.4 4.3 1.1 6.4 1.8 4 1.6 5.6 2.9c1.6 1.2 3 2.7 4 4.5s1.5 4.1 1.5 6.7c0 3.2-.7 5.9-2.2 8.2-1.5 2.2-3.4 4.1-5.7 5.5s-5 2.4-7.8 3.1c-2.9.6-5.7 1-8.5 1-3.4 0-6.6-.4-9.5-1.2s-5.5-2-7.6-3.5c-2.1-1.6-3.8-3.5-5-5.9-1.2-2.3-1.9-5.1-2-8.4h12.1v.1zm39.5-36.9h9.1v-16.4h12v16.3h10.8v8.9h-10.8v29c0 1.3.1 2.3.2 3.3.1.9.4 1.7.7 2.3.4.6 1 1.1 1.7 1.4.8.3 1.8.5 3.2.5.8 0 1.7 0 2.5-.1s1.7-.2 2.5-.4v9.3c-1.3.2-2.6.3-3.9.4-1.3.2-2.5.2-3.9.2-3.2 0-5.7-.3-7.6-.9s-3.4-1.5-4.5-2.6c-1.1-1.2-1.8-2.6-2.2-4.3s-.6-3.8-.7-6v-32h-9.1v-9.1zm40.3 0h11.3v7.4h.2c1.7-3.2 4-5.4 7-6.8s6.2-2.1 9.8-2.1c4.3 0 8 .7 11.2 2.3 3.2 1.5 5.8 3.5 7.9 6.2 2.1 2.6 3.7 5.7 4.7 9.2s1.6 7.3 1.6 11.2c0 3.7-.5 7.2-1.4 10.6-1 3.4-2.4 6.5-4.3 9.1s-4.3 4.7-7.3 6.3-6.4 2.4-10.4 2.4c-1.7 0-3.5-.2-5.2-.5s-3.4-.8-5-1.5-3.1-1.6-4.4-2.7c-1.4-1.1-2.5-2.4-3.4-3.8h-.2v27.1h-12v-74.4zm41.9 27.2c0-2.4-.3-4.8-1-7.1-.6-2.3-1.6-4.3-2.9-6.1s-2.9-3.2-4.7-4.3c-1.9-1.1-4.1-1.6-6.5-1.6-5 0-8.8 1.7-11.4 5.2-2.5 3.5-3.8 8.2-3.8 14 0 2.8.3 5.3 1 7.6s1.6 4.3 3 6c1.3 1.7 2.9 3 4.8 4s4 1.5 6.5 1.5c2.8 0 5-.6 6.9-1.7s3.4-2.6 4.7-4.3c1.2-1.8 2.1-3.8 2.6-6.1.5-2.4.8-4.7.8-7.1zm21.1-47.9h12v11.3h-12zm0 20.7h12v54.3h-12zm22.7-20.7h12v75h-12zm48.6 76.5c-4.3 0-8.2-.7-11.6-2.2s-6.2-3.4-8.6-5.9c-2.3-2.5-4.1-5.6-5.3-9.1s-1.9-7.4-1.9-11.5.6-7.9 1.9-11.4c1.2-3.5 3-6.5 5.3-9.1 2.3-2.5 5.2-4.5 8.6-5.9s7.3-2.2 11.6-2.2 8.2.7 11.6 2.2c3.4 1.4 6.2 3.4 8.6 5.9 2.3 2.5 4.1 5.6 5.3 9.1s1.9 7.3 1.9 11.4c0 4.2-.6 8-1.9 11.5s-3 6.5-5.3 9.1c-2.3 2.5-5.2 4.5-8.6 5.9s-7.2 2.2-11.6 2.2zm0-9.5c2.6 0 5-.6 6.9-1.7 2-1.1 3.5-2.6 4.8-4.4s2.2-3.9 2.8-6.1c.6-2.3.9-4.6.9-7 0-2.3-.3-4.6-.9-6.9s-1.5-4.3-2.8-6.1-2.9-3.2-4.8-4.3c-2-1.1-4.3-1.7-6.9-1.7s-5 .6-6.9 1.7c-2 1.1-3.5 2.6-4.8 4.3-1.3 1.8-2.2 3.8-2.8 6.1s-.9 4.6-.9 6.9c0 2.4.3 4.7.9 7s1.5 4.3 2.8 6.1 2.9 3.3 4.8 4.4c2 1.2 4.3 1.7 6.9 1.7zm31-46.3h9.1v-16.4h12v16.3h10.8v8.9h-10.8v29c0 1.3.1 2.3.2 3.3.1.9.4 1.7.7 2.3.4.6 1 1.1 1.7 1.4.8.3 1.8.5 3.2.5.8 0 1.7 0 2.5-.1s1.7-.2 2.5-.4v9.3c-1.3.2-2.6.3-3.9.4-1.3.2-2.5.2-3.9.2-3.2 0-5.7-.3-7.6-.9s-3.4-1.5-4.5-2.6c-1.1-1.2-1.8-2.6-2.2-4.3s-.6-3.8-.7-6v-32h-9.1v-9.1z"
                fill="currentColor"
            />
            <path
                d="m164.2 300.7h-54.9l-16.9-52.2-17 52.2-54.9-.1 44.4 32.3-17 52.2 44.4-32.3 44.4 32.3-16.9-52.2z"
                fill="#00b67a"
            />
            <path
                d="m123.6 344.7-3.8-11.8-27.4 19.9z"
                fill="#005128"
            />
        </svg>
    );
}

export default function HeroHeader({ imageUrl, title, subtitle }: HeroHeaderProps) {
    const { data: tp, isLoading } = useTrustpilotData();

    return (
        <div className="space-y-2">
            {/* Trustpilot Badge – dynamically fetched, links to real profile */}
            <div className="flex items-center justify-center sm:justify-end mb-2">
                {isLoading ? (
                    /* Skeleton loader while fetching */
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card/60 backdrop-blur-sm border border-border animate-pulse">
                        <div className="w-[80px] h-5 rounded bg-muted-foreground/15" />
                        <div className="flex gap-[2px]">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-[18px] h-[18px] rounded-[3px] bg-muted-foreground/15" />
                            ))}
                        </div>
                        <div className="w-16 h-3 rounded bg-muted-foreground/15" />
                    </div>
                ) : tp ? (
                    /* Live badge with Trustpilot branding, star boxes, and review count */
                    <a
                        href={TRUSTPILOT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card/60 backdrop-blur-sm border border-border hover:border-[#00b67a]/50 hover:shadow-[0_0_15px_rgba(0,182,122,0.1)] transition-all duration-300 group"
                    >
                        <TrustpilotLogo />
                        <span className="w-px h-4 bg-border" />
                        <TrustpilotStars rating={tp.stars} />
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-foreground">
                                {tp.trustScore}
                            </span>
                            <span className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">
                                ({tp.totalReviews} reviews)
                            </span>
                        </div>
                        <svg className="w-3 h-3 text-muted-foreground/40 group-hover:text-[#00b67a] transition-colors" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                ) : (
                    /* Fallback – "See our reviews on Trustpilot" link when fetch fails */
                    <a
                        href={TRUSTPILOT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card/60 backdrop-blur-sm border border-border hover:border-[#00b67a]/50 hover:shadow-[0_0_15px_rgba(0,182,122,0.1)] transition-all duration-300 group"
                    >
                        <TrustpilotLogo />
                        <span className="w-px h-4 bg-border" />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            See our reviews on Trustpilot
                        </span>
                        <svg className="w-3 h-3 text-muted-foreground/40 group-hover:text-[#00b67a] transition-colors" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                )}
            </div>

            {/* Hero Card */}
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                {/* Mobile: stacked layout, sm+: side-by-side */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-5">
                    {/* Game Icon + Title row on mobile */}
                    <div className="flex items-center gap-3 sm:block">
                        <div className="shrink-0">
                            <img
                                src={imageUrl || "/placeholder-game.png"}
                                alt={title}
                                className="w-16 h-16 sm:w-32 sm:h-32 aspect-square object-cover rounded-xl sm:rounded-2xl shadow-lg border border-border"
                            />
                        </div>
                        {/* Title + category visible beside icon on mobile only */}
                        <div className="min-w-0 sm:hidden">
                            <h1 className="text-xl font-bold text-foreground leading-tight line-clamp-2">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-muted-foreground text-xs capitalize mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Game Info */}
                    <div className="min-w-0 space-y-2">
                        {/* Title — hidden on mobile (shown beside icon above) */}
                        <h1 className="hidden sm:block text-2xl font-bold text-foreground truncate">
                            {title}
                        </h1>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                                <RiFlashlightFill className="w-3 h-3" />
                                <span className="sm:hidden text-sm">Instant</span>
                                <span className="hidden sm:inline">Instant Delivery</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                <RiShieldCheckFill className="w-3 h-3" />
                                <span className="sm:hidden text-sm">Secure</span>
                                <span className="hidden sm:inline">Secure Payment</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                                <RiTimeFill className="w-3 h-3" />
                                <span className="sm:hidden text-sm">24/7</span>
                                <span className="hidden sm:inline">24/7 Support</span>
                            </span>
                        </div>

                        {/* Category — hidden on mobile (shown beside icon above) */}
                        {subtitle && (
                            <p className="hidden sm:block text-muted-foreground text-sm capitalize">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
