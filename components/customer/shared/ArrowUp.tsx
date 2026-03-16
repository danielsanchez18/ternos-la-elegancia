"use client";

import { useEffect, useState } from "react";

export const ArrowUp = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById("navbar");

      if (navbar) {
        const navbarHeight = navbar.offsetHeight;
        setIsVisible(window.scrollY > navbarHeight);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isVisible && (
    <a href="#navbar" 
      className="p-1 rounded-2xl bg-white border-4 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 block group">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        stroke="1"
        className="size-10 rotate-45 group-hover:rotate-0 transition-transform duration-300"
      >
        <path
          fill="currentColor"
          d="M12.884 5.116a1.253 1.253 0 0 0-1.768 0l-5 5a1.25 1.25 0 0 0 1.768 1.768l2.866-2.866V18a1.25 1.25 0 1 0 2.5 0V9.018l2.866 2.866a1.25 1.25 0 1 0 1.768-1.768z"
        />
      </svg>
    </a>
  );
};
