/**
 * Portraits.js - Original procedural SVG character illustrations for:
 * - Captain Flynn (brave, handsome 13-year-old resistance leader with windswept red hair)
 * - Princess Odette (regal adult red-haired princess in flowing glowing dress with crown)
 * - Tallow Alien (red-haired child-like alien scout with loincloth and unicorn horn spear)
 */

export const PORTRAITS = {
  flynn: `
    <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="flynnBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1d3557" />
          <stop offset="100%" stop-color="#0b1320" />
        </radialGradient>
        <linearGradient id="flynnHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff5722" />
          <stop offset="60%" stop-color="#e63946" />
          <stop offset="100%" stop-color="#9d0208" />
        </linearGradient>
        <linearGradient id="flynnJacket" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2a9d8f" />
          <stop offset="100%" stop-color="#1b4332" />
        </linearGradient>
      </defs>
      <!-- Background Circle -->
      <circle cx="60" cy="60" r="56" fill="url(#flynnBg)" stroke="#00e5ff" stroke-width="3" />

      <!-- Flight Jacket Collar & Shoulders -->
      <path d="M 25 110 Q 60 85 95 110 L 95 120 L 25 120 Z" fill="url(#flynnJacket)" />
      <path d="M 45 92 L 60 108 L 75 92" stroke="#d8e2ec" stroke-width="2" fill="none" />
      <polygon points="40,88 60,112 48,112" fill="#582f0e" />
      <polygon points="80,88 60,112 72,112" fill="#582f0e" />

      <!-- Neck & Face -->
      <polygon points="50,75 70,75 66,95 54,95" fill="#e8b89d" />
      <path d="M 38 48 C 38 78 82 78 82 48 C 82 30 38 30 38 48 Z" fill="#ffd1b3" />

      <!-- Windswept Red Hair -->
      <path d="M 32 45 C 28 25 50 12 75 16 C 92 18 100 32 94 48 C 90 35 78 26 62 26 C 45 26 36 34 32 45 Z" fill="url(#flynnHair)" />
      <path d="M 28 42 C 20 28 35 15 52 14 C 42 20 36 28 35 38 Z" fill="#ff7b00" />
      <path d="M 72 15 C 88 12 102 24 98 42 C 94 30 85 22 72 15 Z" fill="#ff7b00" />
      <path d="M 35 38 Q 48 30 65 32 Q 52 38 42 45 Z" fill="url(#flynnHair)" />

      <!-- Handsome, determined boy eyes and expression -->
      <ellipse cx="49" cy="52" rx="3.5" ry="4.5" fill="#1d3557" />
      <circle cx="50" cy="51" r="1.5" fill="#ffffff" />
      <ellipse cx="71" cy="52" rx="3.5" ry="4.5" fill="#1d3557" />
      <circle cx="72" cy="51" r="1.5" fill="#ffffff" />
      <!-- Eyebrows (focused, confident) -->
      <path d="M 43 45 Q 50 43 56 46" stroke="#9d0208" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d="M 77 45 Q 70 43 64 46" stroke="#9d0208" stroke-width="2.5" fill="none" stroke-linecap="round" />

      <!-- Nose & Smile -->
      <path d="M 60 52 L 58 60 L 63 60" stroke="#d99b7b" stroke-width="1.8" fill="none" stroke-linecap="round" />
      <path d="M 52 68 Q 60 74 68 68" stroke="#a44a3f" stroke-width="2" fill="none" stroke-linecap="round" />

      <!-- Resistance Star Insignia -->
      <circle cx="60" cy="104" r="4" fill="#00e5ff" />
    </svg>
  `,

  odette: `
    <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="odetteBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#4a154b" />
          <stop offset="100%" stop-color="#130419" />
        </radialGradient>
        <linearGradient id="odetteHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff4d00" />
          <stop offset="50%" stop-color="#d00000" />
          <stop offset="100%" stop-color="#6a040f" />
        </linearGradient>
        <linearGradient id="odetteGown" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="50%" stop-color="#e0aaff" />
          <stop offset="100%" stop-color="#7b2cbf" />
        </linearGradient>
      </defs>
      <!-- Background Circle -->
      <circle cx="60" cy="60" r="56" fill="url(#odetteBg)" stroke="#ffd700" stroke-width="3" />

      <!-- Flowing Regal Glowing Gown -->
      <path d="M 20 115 Q 60 80 100 115 L 100 120 L 20 120 Z" fill="url(#odetteGown)" />
      <ellipse cx="60" cy="92" rx="14" ry="4" fill="#ffb703" opacity="0.8" />

      <!-- Neck & Regal Adult Face -->
      <polygon points="53,68 67,68 64,88 56,88" fill="#fce0d2" />
      <path d="M 40 45 C 40 72 80 72 80 45 C 80 28 40 28 40 45 Z" fill="#ffe5d9" />

      <!-- Elegant Flowing Red Hair -->
      <path d="M 34 42 C 30 18 52 8 82 14 C 98 18 104 38 96 68 C 90 85 82 95 82 95 C 82 80 84 62 82 48 C 76 28 50 22 40 34 C 36 39 34 50 34 68 C 34 85 28 95 28 95 C 28 80 32 60 34 42 Z" fill="url(#odetteHair)" />

      <!-- Crown / Diadem -->
      <path d="M 44 24 L 48 15 L 54 22 L 60 12 L 66 22 L 72 15 L 76 24 Z" fill="#ffd700" stroke="#ffb703" stroke-width="1.5" />
      <circle cx="60" cy="18" r="2" fill="#00ffff" />

      <!-- Regal Eyes -->
      <ellipse cx="50" cy="48" rx="3.5" ry="3.5" fill="#2d6a4f" />
      <circle cx="51" cy="47" r="1.2" fill="#ffffff" />
      <ellipse cx="70" cy="48" rx="3.5" ry="3.5" fill="#2d6a4f" />
      <circle cx="71" cy="47" r="1.2" fill="#ffffff" />
      <!-- Long lashes / brows -->
      <path d="M 44 43 Q 50 40 56 43" stroke="#6a040f" stroke-width="2" fill="none" />
      <path d="M 76 43 Q 70 40 64 43" stroke="#6a040f" stroke-width="2" fill="none" />

      <!-- Graceful smile -->
      <path d="M 54 62 Q 60 67 66 62" stroke="#d00000" stroke-width="2" fill="none" stroke-linecap="round" />
    </svg>
  `,

  tallow: `
    <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tallowBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#3d261a" />
          <stop offset="100%" stop-color="#150d09" />
        </radialGradient>
      </defs>
      <!-- Background Circle -->
      <circle cx="60" cy="60" r="56" fill="url(#tallowBg)" stroke="#ff4500" stroke-width="3" />

      <!-- Child-like Alien Silhouette -->
      <polygon points="35,115 85,115 75,85 45,85" fill="#8d5b4c" />
      <circle cx="60" cy="55" r="22" fill="#e8a87c" />

      <!-- Wild Red Hair -->
      <path d="M 35 50 Q 25 25 50 20 Q 60 12 75 22 Q 95 24 85 52 Q 98 42 90 28 Q 75 8 50 14 Q 30 18 25 45 Z" fill="#e63946" />

      <!-- Horn-Tipped Fantastical Spear -->
      <line x1="88" y1="115" x2="88" y2="20" stroke="#5a3d28" stroke-width="4" stroke-linecap="round" />
      <!-- Unicorn Horn Tip -->
      <polygon points="84,22 92,22 88,2" fill="#ffffff" stroke="#00e5ff" stroke-width="1.5" />
      <path d="M 85 16 Q 88 14 91 16" stroke="#00e5ff" stroke-width="1" fill="none" />

      <!-- Stylized Alien Eyes -->
      <ellipse cx="50" cy="54" rx="4" ry="5" fill="#ffb703" />
      <ellipse cx="70" cy="54" rx="4" ry="5" fill="#ffb703" />
      <circle cx="50" cy="54" r="2" fill="#000000" />
      <circle cx="70" cy="54" r="2" fill="#000000" />
    </svg>
  `,
};
