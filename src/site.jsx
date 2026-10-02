/* Shared site content: navigation targets, the showreel, and social links. */

export const reel = {
  src: "/assets/reel.mp4",
  preview: "/assets/previews/reel.mp4",
  poster: "/assets/posters/reel.webp",
  title: "Showreel",
  tags: "Short-form • Commercial • Brand film",
};

export const navLinks = [
  { label: "Work", target: "#work" },
  { label: "About", target: "#about" },
  { label: "Services", target: "#services" },
  { label: "Process", target: "#approach" },
  { label: "Contact", target: "#contact" },
];

export const socialIcons = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  X: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.53 3H20.5l-6.48 7.4L21.75 21h-5.9l-4.62-6.04L5.9 21H2.93l6.93-7.92L2.25 3h6.05l4.18 5.52L17.53 3zm-1.04 16.2h1.64L7.6 4.72H5.84L16.49 19.2z" />
    </svg>
  ),
};

export const socials = [
  { label: "Instagram", handle: "@spairo777", href: "https://www.instagram.com/spairo777" },
  { label: "X", handle: "@Spairo7777", href: "https://x.com/Spairo7777" },
];

export function Arrow({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
