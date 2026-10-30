import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Ionicons } from '@expo/vector-icons';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={24} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? Colors.dark.card : Colors.light.card,
          borderTopWidth: 0,
          elevation: 0,
          height: 64 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 4,
        },
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 10,
          lineHeight: 14,
          flexShrink: 0,
        },
        headerTitleStyle: {
          fontFamily: 'Cinzel_700Bold',
          fontSize: 18,
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? Colors.dark.card : Colors.light.card,
        },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="suites"
        options={{
          title: 'Suites',
          tabBarIcon: ({ color }) => <TabBarIcon name="bed-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="apps-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="cart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
