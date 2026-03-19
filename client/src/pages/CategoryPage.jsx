
import { SectionHeader } from "../components/ui/SectionHeader.jsx";
import { useEffect, useRef, useState } from "react";

export default function Categories({ categories }) {
    const scrollRef = useRef(null);
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const autoScrollRef = useRef(null);

    const loopItems = [...categories, ...categories, ...categories];

    // 👉 Start from middle
    useEffect(() => {
        const el = scrollRef.current;
        const middle = el.scrollWidth / 3;
        el.scrollLeft = middle;
    }, []);

    // 👉 Infinite loop reset
    const handleScroll = () => {
        const el = scrollRef.current;
        const third = el.scrollWidth / 3;

        if (el.scrollLeft <= 0) {
            el.scrollLeft = third;
        } else if (el.scrollLeft >= third * 2) {
            el.scrollLeft = third;
        }
    };

    // 👉 AUTO SCROLL
    useEffect(() => {
        const el = scrollRef.current;

        const startAutoScroll = () => {
            autoScrollRef.current = setInterval(() => {
                el.scrollLeft += 0.5; // speed (adjust)
            }, 16); // ~60fps
        };

        const stopAutoScroll = () => {
            clearInterval(autoScrollRef.current);
        };

        startAutoScroll();

        // Pause on interaction
        el.addEventListener("mouseenter", stopAutoScroll);
        el.addEventListener("mouseleave", startAutoScroll);
        el.addEventListener("touchstart", stopAutoScroll);
        el.addEventListener("touchend", startAutoScroll);

        return () => {
            stopAutoScroll();
        };
    }, []);

    // 👉 Mouse drag
    const handleMouseDown = (e) => {
        setIsDown(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseUp = () => setIsDown(false);
    const handleMouseLeave = () => setIsDown(false);

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    // 👉 CLICK TO CENTER
    const handleClick = (e, index) => {
        const el = scrollRef.current;
        const item = e.currentTarget;

        const containerCenter = el.offsetWidth / 2;
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;

        el.scrollTo({
            left: itemCenter - containerCenter,
            behavior: "smooth",
        });
    };

    return (
        <section className="space-y-4">
            <SectionHeader title="Categories" subtitle="Browse by category" />

            <div className="relative overflow-hidden">

                {/* FADES */}
                <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-[#0f0f0f] to-transparent z-10" />
                <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#0f0f0f] to-transparent z-10" />

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                    className="carousel-scroll -mx-4 px-4 cursor-grab active:cursor-grabbing"
                >
                    <div className="flex w-max gap-4">
                        {loopItems.map((category, i) => (
                            <div
                                key={i}
                                onClick={(e) => handleClick(e, i)}
                                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-card border border-[#262626] flex-shrink-0 transition-transform duration-300 active:scale-[0.95]"
                            >
                                {category.image ? (
                                    <>
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                                    </>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-[#262626]" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <span className="text-xs text-muted font-medium">
                                            No image
                                          </span>
                                        </div>
                                    </>
                                )}

                                <div className="absolute inset-x-0 bottom-0 p-3">
                                    <p className="text-sm font-semibold text-white">
                                        {category.name}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}