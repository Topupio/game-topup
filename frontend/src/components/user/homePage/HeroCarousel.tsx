"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Banner } from "@/services/banner";
import { useRouter } from "next/navigation";
import "./hero-carousel.css";

// --- Opacity tween (1:1 from Embla docs) ---

const TWEEN_FACTOR_BASE = 0.84;

const numberWithinRange = (number: number, min: number, max: number): number =>
    Math.min(Math.max(number, min), max);

// --- Hooks (1:1 from Embla v9 docs) ---

function usePrevNextButtons(emblaApi: EmblaCarouselType | undefined) {
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

    const onPrevButtonClick = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.goToPrev();
    }, [emblaApi]);

    const onNextButtonClick = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.goToNext();
    }, [emblaApi]);

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setPrevBtnDisabled(!emblaApi.canGoToPrev());
        setNextBtnDisabled(!emblaApi.canGoToNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on("reinit", onSelect).on("select", onSelect);
    }, [emblaApi, onSelect]);

    return {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    };
}

function useDotButton(emblaApi: EmblaCarouselType | undefined) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onDotButtonClick = useCallback(
        (index: number) => {
            if (!emblaApi) return;
            emblaApi.goTo(index);
        },
        [emblaApi]
    );

    const onInit = useCallback((emblaApi: EmblaCarouselType) => {
        setScrollSnaps(emblaApi.snapList());
    }, []);

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setSelectedIndex(emblaApi.selectedSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onInit(emblaApi);
        onSelect(emblaApi);
        emblaApi
            .on("reinit", onInit)
            .on("reinit", onSelect)
            .on("select", onSelect);
    }, [emblaApi, onInit, onSelect]);

    return { selectedIndex, scrollSnaps, onDotButtonClick };
}

function useAutoplay(emblaApi: EmblaCarouselType | undefined) {
    const onAutoplayButtonClick = useCallback(
        (callback: () => void) => {
            const autoplay = emblaApi?.plugins()?.autoplay;
            if (!autoplay) return;
            autoplay.stop();
            callback();
        },
        [emblaApi]
    );

    useEffect(() => {
        const autoplay = emblaApi?.plugins()?.autoplay;
        if (!autoplay) return;
        emblaApi.on("reinit", () => autoplay.isPlaying());
    }, [emblaApi]);

    return { onAutoplayButtonClick };
}

function useAutoplayProgress<T extends HTMLElement>(
    emblaApi: EmblaCarouselType | undefined,
    progressNode: React.RefObject<T | null>
) {
    const [showAutoplayProgress, setShowAutoplayProgress] = useState(false);
    const animationName = useRef("");
    const timeoutId = useRef(0);
    const rafId = useRef(0);

    const startProgress = useCallback(
        (timeUntilNext: number | null) => {
            const node = progressNode.current;
            if (!node) return;
            if (timeUntilNext === null) return;

            if (!animationName.current) {
                const style = window.getComputedStyle(node);
                animationName.current = style.animationName;
            }

            node.style.animationName = "none";
            node.style.transform = "translate3d(0,0,0)";

            rafId.current = window.requestAnimationFrame(() => {
                timeoutId.current = window.setTimeout(() => {
                    node.style.animationName = animationName.current;
                    node.style.animationDuration = `${timeUntilNext}ms`;
                }, 0);
            });

            setShowAutoplayProgress(true);
        },
        [progressNode]
    );

    useEffect(() => {
        const autoplay = emblaApi?.plugins()?.autoplay;
        if (!autoplay) return;
        emblaApi
            .on("autoplay:timerset" as any, () =>
                startProgress(autoplay.timeUntilNext())
            )
            .on("autoplay:timerstopped" as any, () =>
                setShowAutoplayProgress(false)
            );
    }, [emblaApi, startProgress]);

    useEffect(() => {
        return () => {
            cancelAnimationFrame(rafId.current);
            clearTimeout(timeoutId.current);
        };
    }, []);

    return { showAutoplayProgress };
}

// --- Component ---

export default function HeroCarousel({ banners }: { banners: Banner[] }) {
    const router = useRouter();
    const progressNode = useRef<HTMLDivElement>(null);
    const tweenFactor = useRef(0);

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 5000 }),
    ]);

    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    } = usePrevNextButtons(emblaApi);

    const { selectedIndex, scrollSnaps, onDotButtonClick } =
        useDotButton(emblaApi);

    const { onAutoplayButtonClick } = useAutoplay(emblaApi);

    const { showAutoplayProgress } = useAutoplayProgress(
        emblaApi,
        progressNode
    );

    // --- Opacity tween logic (1:1 from Embla docs) ---
    const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
        tweenFactor.current =
            TWEEN_FACTOR_BASE * emblaApi.snapList().length;
    }, []);

    const tweenOpacity = useCallback(
        (emblaApi: EmblaCarouselType, event?: any) => {
            const engine = emblaApi.internalEngine();
            const scrollProgress = emblaApi.scrollProgress();
            const slidesInView = emblaApi.slidesInView();
            const isScrollEvent = event?.type === "scroll";

            emblaApi.snapList().forEach((scrollSnap, snapIndex) => {
                let diffToTarget = scrollSnap - scrollProgress;
                const slidesInSnap =
                    engine.scrollSnapList.slidesBySnap[snapIndex];

                slidesInSnap.forEach((slideIndex) => {
                    if (isScrollEvent && !slidesInView.includes(slideIndex))
                        return;

                    if (engine.options.loop) {
                        engine.slideLooper.loopPoints.forEach((loopItem) => {
                            const target = loopItem.target();

                            if (
                                slideIndex === loopItem.index &&
                                target !== 0
                            ) {
                                const sign = Math.sign(target);

                                if (sign === -1) {
                                    diffToTarget =
                                        scrollSnap - (1 + scrollProgress);
                                }
                                if (sign === 1) {
                                    diffToTarget =
                                        scrollSnap + (1 - scrollProgress);
                                }
                            }
                        });
                    }

                    const tweenValue =
                        1 - Math.abs(diffToTarget * tweenFactor.current);
                    const opacity = numberWithinRange(
                        tweenValue,
                        0,
                        1
                    ).toString();
                    emblaApi.slideNodes()[slideIndex].style.opacity = opacity;
                });
            });
        },
        []
    );

    useEffect(() => {
        if (!emblaApi) return;

        setTweenFactor(emblaApi);
        tweenOpacity(emblaApi);

        emblaApi
            .on("reinit", setTweenFactor)
            .on("reinit", tweenOpacity)
            .on("scroll", tweenOpacity)
            .on("slidefocus", tweenOpacity);

        return () => {
            emblaApi
                .off("reinit", setTweenFactor)
                .off("reinit", tweenOpacity)
                .off("scroll", tweenOpacity)
                .off("slidefocus", tweenOpacity);
        };
    }, [emblaApi, tweenOpacity, setTweenFactor]);

    const handleRedirect = (slug: string) => {
        router.push(`/games/${slug}`);
    };

    if (!banners.length) return null;

    return (
        <section className="relative">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="relative lg:mt-8 mt-3">
                    <div className="embla">
                        <div className="embla__viewport" ref={emblaRef}>
                            <div className="embla__container">
                                {banners.map((banner) => (
                                    <div
                                        className="embla__slide"
                                        key={banner._id}
                                    >
                                        <div
                                            className={`embla__slide__inner aspect-[30/8] ${
                                                banner.link
                                                    ? "cursor-pointer"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                banner.link &&
                                                handleRedirect(banner.link)
                                            }
                                        >
                                            {/* Desktop Image */}
                                            <img
                                                src={
                                                    banner.imageUrl ??
                                                    "/placeholder.png"
                                                }
                                                alt={banner.title}
                                                className={`absolute inset-0 w-full h-full object-cover ${
                                                    banner.mobileImageUrl
                                                        ? "hidden lg:block"
                                                        : ""
                                                }`}
                                            />
                                            {/* Mobile Image */}
                                            {banner.mobileImageUrl && (
                                                <img
                                                    src={
                                                        banner.mobileImageUrl
                                                    }
                                                    alt={banner.title}
                                                    className="absolute inset-0 w-full h-full object-cover lg:hidden"
                                                />
                                            )}

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/30" />

                                            {/* Title */}
                                            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
                                                <h3 className="text-4xl font-black mb-2">
                                                    {banner.title}
                                                </h3>
                                            </div>

                                            {/* Border effect */}
                                            <div className="absolute inset-0 pointer-events-none border-2 border-white/20 rounded-xl" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Prev/Next Buttons */}
                        <button
                            onClick={() =>
                                onAutoplayButtonClick(onPrevButtonClick)
                            }
                            disabled={prevBtnDisabled}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all hover:scale-110 disabled:opacity-30"
                        >
                            <FaChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() =>
                                onAutoplayButtonClick(onNextButtonClick)
                            }
                            disabled={nextBtnDisabled}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all hover:scale-110 disabled:opacity-30"
                        >
                            <FaChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Controls: Dots + Progress */}
                    <div className="embla__controls">
                        <div className="flex items-center gap-2">
                            {scrollSnaps.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => onDotButtonClick(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        index === selectedIndex
                                            ? "bg-gradient-neon w-8"
                                            : "bg-muted-foreground/40 w-2 hover:bg-muted-foreground/60"
                                    }`}
                                />
                            ))}
                        </div>

                        <div
                            className={`embla__progress`.concat(
                                showAutoplayProgress
                                    ? ""
                                    : " embla__progress--hidden"
                            )}
                        >
                            <div
                                className="embla__progress__bar"
                                ref={progressNode}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
