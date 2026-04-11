import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 64 64" 
      width={size} 
      height={size}
      className={className}
    >
      <rect width="64" height="64" rx="16" fill="#0b0b0b"/>
      <path d="M18 42V22h9c8 0 13 4 13 10s-5 10-13 10h-9zm9-6c4 0 7-1 7-4s-3-4-7-4h-3v8h3z" fill="#f5f5f5"/>
      <path d="M42 42V22h6v20z" fill="#9f9f9f"/>
    </svg>
  );
}
