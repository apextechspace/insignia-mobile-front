import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

export const useTheme = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return {
        colors: theme,
        isDark: colorScheme === 'dark',
        brand: {
            primary: '#4B1D3F',
            background: '#F9F7F5',
            text: '#2D2D2D',
            muted: '#7D7D7D',
        },
        fonts: {
            heading: 'Cinzel_700Bold',
            body: 'Inter_400Regular',
            button: 'Poppins_600SemiBold',
            elegant: 'PlayfairDisplay_700Bold',
        }
    };
};
