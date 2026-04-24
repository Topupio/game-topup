"use client";

import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Banner } from "@/services/banner";
import { useRouter } from "next/navigation";
import "./hero-carousel.css";

// --- Scale tween (1:1 from Embla docs) ---

const TWEEN_FACTOR_BASE = 0.15;
const MAX_ROTATE = 40;
const ROTATE_FACTOR = 160;
const AUTOPLAY_DELAY = 4000;
const SIDE_FADE_FACTOR = 0.8;
const MIN_SLIDE_OPACITY = 0.5;

const numberWithinRange = (number: number, min: number, max: number): number =>
    Math.min(Math.max(number, min), max);
type AutoplayApi = ReturnType<typeof Autoplay>;
const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

function useAutoplay(
    emblaApi: EmblaCarouselType | undefined,
    autoplay: AutoplayApi
) {
    const fallbackIntervalRef = useRef<number | null>(null);

    const clearFallbackInterval = useCallback(() => {
        if (fallbackIntervalRef.current !== null) {
            window.clearInterval(fallbackIntervalRef.current);
            fallbackIntervalRef.current = null;
        }
    }, []);

    const startFallbackInterval = useCallback(() => {
        if (!emblaApi) return;
        if (emblaApi.snapList().length <= 1) return;

        clearFallbackInterval();
        fallbackIntervalRef.current = window.setInterval(() => {
            emblaApi.goToNext();
        }, AUTOPLAY_DELAY);
    }, [clearFallbackInterval, emblaApi]);

    const resumeAutoplay = useCallback(() => {
        if (!emblaApi) return;

        if (emblaApi.snapList().length <= 1) {
            autoplay.stop();
            clearFallbackInterval();
            return;
        }

        autoplay.play();
        // Fallback for RC autoplay edge cases where play() doesn't start.
        window.setTimeout(() => {
            if (autoplay.isPlaying()) {
                clearFallbackInterval();
                return;
            }

            startFallbackInterval();
        }, 50);
    }, [autoplay, clearFallbackInterval, emblaApi, startFallbackInterval]);

    const onAutoplayButtonClick = useCallback(
        (callback: () => void) => {
            callback();
            resumeAutoplay();
        },
        [resumeAutoplay]
    );

    useEffect(() => {
        if (!emblaApi) return;

        const handleReinit = () => resumeAutoplay();
        resumeAutoplay();
        emblaApi.on("reinit", handleReinit);

        return () => {
            emblaApi.off("reinit", handleReinit);
        };
    }, [emblaApi, resumeAutoplay]);

    useEffect(() => {
        if (!emblaApi) return;

        const rootNode = emblaApi.rootNode();
        if (!rootNode) return;

        let isHovering = false;
        let isFocusedWithin = false;

        const syncAutoplay = () => {
            if (isHovering || isFocusedWithin) {
                autoplay.pause();
                clearFallbackInterval();
                return;
            }

            resumeAutoplay();
        };

        const handleMouseEnter = () => {
            isHovering = true;
            syncAutoplay();
        };

        const handleMouseLeave = () => {
            isHovering = false;
            syncAutoplay();
        };

        const handleFocusIn = () => {
            isFocusedWithin = true;
            syncAutoplay();
        };

        const handleFocusOut = (event: FocusEvent) => {
            const nextTarget = event.relatedTarget as Node | null;

            if (nextTarget && rootNode.contains(nextTarget)) {
                return;
            }

            isFocusedWithin = false;
            syncAutoplay();
        };

        rootNode.addEventListener("mouseenter", handleMouseEnter);
        rootNode.addEventListener("mouseleave", handleMouseLeave);
        rootNode.addEventListener("focusin", handleFocusIn);
        rootNode.addEventListener("focusout", handleFocusOut);

        return () => {
            rootNode.removeEventListener("mouseenter", handleMouseEnter);
            rootNode.removeEventListener("mouseleave", handleMouseLeave);
            rootNode.removeEventListener("focusin", handleFocusIn);
            rootNode.removeEventListener("focusout", handleFocusOut);
        };
    }, [autoplay, clearFallbackInterval, emblaApi, resumeAutoplay]);

    useEffect(() => {
        return () => {
            clearFallbackInterval();
        };
    }, [clearFallbackInterval]);

    return { onAutoplayButtonClick };
}

function useAutoplayProgress<T extends HTMLElement>(
    emblaApi: EmblaCarouselType | undefined,
    autoplay: AutoplayApi,
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
        if (!emblaApi) return;
        emblaApi
            .on("autoplay:timerset" as any, () =>
                startProgress(autoplay.timeUntilNext())
            )
            .on("autoplay:timerstopped" as any, () =>
                setShowAutoplayProgress(false)
            );
    }, [autoplay, emblaApi, startProgress]);

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
    const tweenNodes = useRef<HTMLElement[]>([]);
    const autoplayRef = useRef<ReturnType<typeof Autoplay> | null>(null);

    if (!autoplayRef.current) {
        autoplayRef.current = Autoplay({
            delay: AUTOPLAY_DELAY,
            defaultInteraction: false,
        });
    }
    const autoplay = autoplayRef.current;

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        autoplay,
    ]);

    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    } = usePrevNextButtons(emblaApi);

    const { selectedIndex, scrollSnaps, onDotButtonClick } =
        useDotButton(emblaApi);

    const { onAutoplayButtonClick } = useAutoplay(emblaApi, autoplay);

    const { showAutoplayProgress } = useAutoplayProgress(
        emblaApi,
        autoplay,
        progressNode
    );

    // --- Scale tween logic (1:1 from Embla docs) ---

    const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
        tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
            return slideNode.querySelector(
                ".embla__slide__inner"
            ) as HTMLElement;
        });
    }, []);

    const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
        tweenFactor.current =
            TWEEN_FACTOR_BASE * emblaApi.snapList().length;
    }, []);

    const tweenScale = useCallback(
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
                    const scale = numberWithinRange(
                        tweenValue,
                        0,
                        1
                    ).toString();
                    const rotateY = numberWithinRange(
                        diffToTarget * ROTATE_FACTOR,
                        -MAX_ROTATE,
                        MAX_ROTATE
                    );
                    const opacity = numberWithinRange(
                        1 - Math.abs(diffToTarget) * SIDE_FADE_FACTOR,
                        MIN_SLIDE_OPACITY,
                        1
                    ).toString();
                    const tweenNode = tweenNodes.current[slideIndex];
                    if (tweenNode) {
                        tweenNode.style.transform = `perspective(1200px) scale(${scale}) rotateY(${rotateY}deg)`;
                        tweenNode.style.opacity = opacity;
                        // Pull scaled-down slides closer to active slide
                        if (diffToTarget > 0) {
                            tweenNode.style.transformOrigin = "left center";
                        } else if (diffToTarget < 0) {
                            tweenNode.style.transformOrigin = "right center";
                        } else {
                            tweenNode.style.transformOrigin = "center center";
                        }
                    }
                });
            });
        },
        []
    );

    useIsomorphicLayoutEffect(() => {
        if (!emblaApi) return;

        setTweenNodes(emblaApi);
        setTweenFactor(emblaApi);
        tweenScale(emblaApi);

        emblaApi
            .on("reinit", setTweenNodes)
            .on("reinit", setTweenFactor)
            .on("reinit", tweenScale)
            .on("scroll", tweenScale)
            .on("slidefocus", tweenScale);

        return () => {
            emblaApi
                .off("reinit", setTweenNodes)
                .off("reinit", setTweenFactor)
                .off("reinit", tweenScale)
                .off("scroll", tweenScale)
                .off("slidefocus", tweenScale);
        };
    }, [emblaApi, tweenScale, setTweenNodes, setTweenFactor]);

    const handleRedirect = (slug: string) => {
        router.push(`/games/${slug}`);
    };

    if (!banners.length) return null;

    return (
        <section className="relative">
            <div className="relative z-10">
                <div className="relative  mt-2">
                    <div className="embla">
                        <div className="embla__viewport" ref={emblaRef}>
                            <div className="embla__container">
                                {banners.map((banner, index) => (
                                    <div
                                        className="embla__slide"
                                        key={banner._id}
                                    >
                                        <div
                                            className={`embla__slide__inner aspect-[16/9] lg:aspect-[30/8] ${
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
                                                loading={index === 0 ? "eager" : "lazy"}
                                                fetchPriority={index === 0 ? "high" : "auto"}
                                                decoding={index === 0 ? "sync" : "async"}
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
                                                    loading={index === 0 ? "eager" : "lazy"}
                                                    fetchPriority={index === 0 ? "high" : "auto"}
                                                    decoding={index === 0 ? "sync" : "async"}
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
                                    onClick={() =>
                                        onAutoplayButtonClick(() =>
                                            onDotButtonClick(index)
                                        )
                                    }
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
