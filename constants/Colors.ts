const brandPrimary = '#4A0E2E'; // Rich Insignia Plum
const brandBackground = '#F9F7F5'; // Soft Off-white
const brandText = '#2D2D2D'; // Dark Gray
const brandMuted = '#7D7D7D'; // Muted Gray

export default {
  light: {
    text: brandText,
    background: brandBackground,
    tint: brandPrimary,
    tabIconDefault: brandMuted,
    tabIconSelected: brandPrimary,
    card: '#FFFFFF',
    border: '#E0E0E0',
    notification: brandPrimary,
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A1A1A',
    tint: '#D4A5C6', // Lighter plum for dark mode tint
    tabIconDefault: '#7D7D7D',
    tabIconSelected: '#FFFFFF',
    card: '#2D2D2D',
    border: '#404040',
    notification: brandPrimary,
  },
};
