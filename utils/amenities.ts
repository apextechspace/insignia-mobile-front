import { Ionicons } from '@expo/vector-icons';

export interface Amenity {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
}

export const AMENITY_MAP: Record<string, Amenity> = {
    'wifi': { id: 'wifi', name: 'Ultra-Fast WiFi', icon: 'wifi-outline' },
    'tv': { id: 'tv', name: 'Smart TV', icon: 'tv-outline' },
    'pool': { id: 'pool', name: 'Private Pool', icon: 'water-outline' },
    'person': { id: 'person', name: 'Butler Service', icon: 'person-outline' },
    'wine': { id: 'wine', name: 'Mini-bar', icon: 'wine-outline' },
    'sparkles': { id: 'sparkles', name: 'Spa Access', icon: 'sparkles-outline' },
    'restaurant': { id: 'restaurant', name: 'Breakfast Included', icon: 'restaurant-outline' },
    'fitness': { id: 'fitness', name: 'Gym / Fitness', icon: 'fitness-outline' },
    'snow': { id: 'snow', name: 'Air Conditioning', icon: 'snow-outline' },
    'ac': { id: 'ac', name: 'Air Conditioning', icon: 'snow-outline' },
    'car': { id: 'car', name: 'Free Parking', icon: 'car-outline' },
    'speedometer': { id: 'speedometer', name: 'High-speed Internet', icon: 'speedometer-outline' },
    'coffee': { id: 'coffee', name: 'Coffee & Tea', icon: 'cafe-outline' },
    'kitchenette': { id: 'kitchenette', name: 'Kitchenette', icon: 'restaurant-outline' },
    'fullkitchen': { id: 'fullkitchen', name: 'Full Kitchen', icon: 'restaurant-outline' },
    'desk': { id: 'desk', name: 'Work Desk', icon: 'briefcase-outline' },
    'sofa': { id: 'sofa', name: 'Lounge Area', icon: 'apps-outline' },
    'livingroom': { id: 'livingroom', name: 'Living Room', icon: 'desktop-outline' },
    'balcony': { id: 'balcony', name: 'Private Balcony', icon: 'leaf-outline' },
    'bath': { id: 'bath', name: 'Luxury Bath', icon: 'water-outline' },
};

export const getAmenityData = (key: string): Amenity => {
    if (!key) return { id: 'unknown', name: '', icon: 'help-circle-outline' };
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
    return AMENITY_MAP[normalizedKey] || { id: key, name: key, icon: 'help-circle-outline' };
};
