import React from 'react';
import { Link } from 'react-router-dom';

export function BrandMark({
  to = '/',
  tone = 'dark',
}: {
  to?: string;
  tone?: 'dark' | 'light';
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 font-display text-[1.15rem] font-bold tracking-[-0.03em] whitespace-nowrap shrink-0 transition-opacity hover:opacity-80 ${
        tone === 'light' ? 'text-white' : 'text-[#17191F]'
      }`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="2"
          y="3"
          width="20"
          height="18"
          rx="4"
          stroke={tone === 'light' ? '#FFFFFF' : '#17191F'}
          strokeWidth="1.75"
        />
        <path
          d="M2 8.5H22"
          stroke={tone === 'light' ? '#FFFFFF' : '#17191F'}
          strokeWidth="1.75"
        />
        <rect x="6.5" y="12" width="5" height="5" rx="1.2" fill="#4665E8" />
        <path
          d="M14.5 13H18M14.5 16H17"
          stroke={tone === 'light' ? '#FFFFFF' : '#17191F'}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
      <span>BOOKLY</span>
    </Link>
  );
}
