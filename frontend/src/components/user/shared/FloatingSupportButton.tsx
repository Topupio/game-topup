"use client";

const FloatingSupportButton = () => {
    return (
        <a
            href="https://wa.me/919497110191"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-0 sm:gap-2 rounded-full bg-yellow-400 sm:bg-white p-0 sm:pl-4 sm:pr-1.5 sm:py-1.5 shadow-lg transition-transform hover:scale-105"
        >
            <span className="hidden sm:inline text-sm font-bold text-gray-900">24/7</span>
            <span className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-yellow-400">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                >
                    <path d="M3 11h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z" />
                    <path d="M19 11h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z" />
                    <path d="M2 12v-2a10 10 0 0 1 20 0v2" />
                    <path d="M22 17v1a2 2 0 0 1-2 2h-4" />
                </svg>
            </span>
        </a>
    );
};

export default FloatingSupportButton;
