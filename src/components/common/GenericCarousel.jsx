import React, { useRef } from "react";

export default function GenericCarousel({
  title,
  items = [],
  renderItem,
  settings = {},
}) {
  const scrollRef = useRef(null);

  // Default configuration
  const mergedSettings = {
    itemWidthDesktop: "20rem", // ≈5 items on desktop
    itemWidthMobile: "45%",    // ≈2 items on mobile
    gap: "1rem",
    scrollAmount: 300,
    ...settings,
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const newPos =
      direction === "left"
        ? scrollLeft - mergedSettings.scrollAmount
        : scrollLeft + mergedSettings.scrollAmount;
    scrollRef.current.scrollTo({ left: newPos, behavior: "smooth" });
  };

  return (
    <div className="relative w-full py-6 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* 🎵 Title */}
      {title && (
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-center text-slate-800 dark:text-yellow-400">
          {title}
        </h2>
      )}

      {items.length > 0 ? (
        <div className="relative group">
          {/* ◀ Left Button */}
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800/70 hover:bg-slate-800 text-white p-3 rounded-full shadow-md"
          >
            ◀
          </button>

          {/* ▶ Right Button */}
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800/70 hover:bg-slate-800 text-white p-3 rounded-full shadow-md"
          >
            ▶
          </button>

          {/* 🧭 Scrollable Row */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto scroll-smooth space-x-4 px-10 hide-scrollbar"
          >
            {/* Left-side padding (visual centering) */}
            <div className="flex-shrink-0 w-4 sm:w-8 lg:w-16" />
            {items.map((item, index) => (
              <div
                key={index}
                className="snap-center flex-shrink-0 transform transition-transform hover:scale-105 will-change-transform"
                style={{ width: mergedSettings.itemWidthDesktop }}
              >
                {renderItem(item, index)}
              </div>

            ))}
            {/* Right-side padding */}
            <div className="flex-shrink-0 w-4 sm:w-8 lg:w-16" />
          </div>

          {/* 📱 Inline mobile size tweak */}
          <style jsx>{`
            @media (max-width: 768px) {
              div[style*="width: ${mergedSettings.itemWidthDesktop}"] {
                width: ${mergedSettings.itemWidthMobile} !important;
              }
            }
            /* Hide scrollbar for all browsers */
            .hide-scrollbar {
              scrollbar-width: none; /* Firefox */
            }
            .hide-scrollbar::-webkit-scrollbar {
              display: none; /* Chrome, Safari */
            }
          `}</style>
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          No items found.
        </p>
      )}
    </div>
  );
}
