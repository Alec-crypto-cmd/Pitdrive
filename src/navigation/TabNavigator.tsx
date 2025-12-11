import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // built into Expo

import WelcomeScreen from '../screens/WelcomeScreen';
import MapScreen from '../components/MapScreen';
import { StatsScreen, FriendsScreen, SettingsScreen } from '../screens/PlaceholderScreens';

const Tab = createBottomTabNavigator();

// Custom Theme Colors
const ACTIVE_COLOR = '#8B9C9A'; // Light Teal
const INACTIVE_COLOR = '#586e75'; // Muted
const BAR_BG = '#002B36'; // Dark

export default function AppNavigator() {
    return (
        <NavigationContainer theme={{
            dark: true,
            colors: {
                ...DarkTheme.colors,
                background: '#002B36',
                card: BAR_BG,
                text: '#fff',
                border: '#073642'
            }
        }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: BAR_BG,
                        borderTopColor: '#073642',
                        height: Platform.OS === 'ios' ? 88 : 60,
                        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                        paddingTop: 8,
                        elevation: 8
                    },
                    tabBarActiveTintColor: ACTIVE_COLOR,
                    tabBarInactiveTintColor: INACTIVE_COLOR,
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName: keyof typeof Ionicons.glyphMap;

                        if (route.name === 'Home') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'Stats') {
                            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                        } else if (route.name === 'Map') {
                            iconName = focused ? 'map' : 'map-outline';
                        } else if (route.name === 'Friends') {
                            iconName = focused ? 'people' : 'people-outline';
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'settings' : 'settings-outline';
                        } else {
                            iconName = 'alert';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                })}
            >
                <Tab.Screen name="Home" component={WelcomeScreen} />
                <Tab.Screen name="Stats" component={StatsScreen} />
                <Tab.Screen name="Map" component={MapScreen} />
                <Tab.Screen name="Friends" component={FriendsScreen} />
                <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
