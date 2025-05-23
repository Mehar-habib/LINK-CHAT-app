import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import animationData from "@/assets/lottie-json";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// An array of color styles used for user badges or UI elements.
// Each string defines a Tailwind-style background, text, and border color with transparency.
export const colors = [
  "bg-[#712c4a57] text-[#ff006e] border-[1px] border-[#ff006faa]", // Dark pink theme
  "bg-[#ffd60a2a] text-[#ffd60a] border-[1px] border-[#ffd60abb]", // Yellow theme
  "bg-[#06d6a02a] text-[#06d6a0] border-[1px] border-[#06d6a0bb]", // Teal theme
  "bg-[#4cc9f02a] text-[#4cc9f0] border-[1px] border-[#4cc9f0bb]", // Light blue theme
];

// Utility function to get a color style based on a numeric index
// If the index is within range (0 to colors.length - 1), return the corresponding color
// Otherwise, return the first color as the default fallback
export const getColor = (color) => {
  if (color >= 0 && color < colors.length) {
    return colors[color];
  }
  return colors[0];
};

export const animationDefaultOptions = {
  loop: true,
  autoplay: true,
  animationData,
};
