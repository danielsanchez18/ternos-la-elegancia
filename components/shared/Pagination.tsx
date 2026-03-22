import React from "react";

export const Pagination = () => {
  return (
    <div className="flex items-center gap-x-1 mx-auto">
      {/* Arrow Left */}
      <button className="w-10 h-10 hover:bg-black/20 text-primary flex items-center justify-center transition-colors duration-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-arrow-left-icon lucide-arrow-left"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      </button>

      {/* Page Numbers */}
      <button className="w-10 h-10 bg-primary text-xl font-medium text-white flex items-center justify-center transition-colors duration-200">
        1
      </button>
      <button className="w-10 h-10 hover:bg-black/20 text-xl font-medium text-primary flex items-center justify-center transition-colors duration-200">
        2
      </button>
      <button className="w-10 h-10 hover:bg-black/20 text-xl font-medium text-primary flex items-center justify-center transition-colors duration-200">
        3
      </button>
      <button className="w-10 h-10 hover:bg-black/20 text-xl font-medium text-primary flex items-center justify-center transition-colors duration-200">
        4
      </button>
      <button className="w-10 h-10 hover:bg-black/20 text-xl font-medium text-primary flex items-center justify-center transition-colors duration-200">
        5
      </button>

      {/* Arrow Right */}
      <button className="w-10 h-10 hover:bg-black/20 text-primary flex items-center justify-center transition-colors duration-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-arrow-right-icon lucide-arrow-right"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
