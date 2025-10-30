import React from "react";
import Slider from "react-slick";

export default function GenericCarousel({
  title,
  items = [],
  renderItem,
  settings = {},
}) {
  const defaultSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    responsive: [
      { breakpoint: 200, settings: { slidesToShow: 3 } },
      { breakpoint: 100, settings: { slidesToShow: 2 } },
      { breakpoint: 10, settings: { slidesToShow: 1 } },
    ],
  };

  const mergedSettings = { ...defaultSettings, ...settings };

  return (
    <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {title && (
        <h2 className="text-3xl font-extrabold mb-6 text-center text-slate-800 dark:text-yellow-400">
          {title}
        </h2>
      )}

      {items.length > 0 ? (
        <div className="relative">
          <Slider {...mergedSettings}>
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 group cursor-pointer transform transition-transform hover:scale-105"
              >
                {renderItem(item, idx)}
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          No items found.
        </p>
      )}
    </div>
  );
}
