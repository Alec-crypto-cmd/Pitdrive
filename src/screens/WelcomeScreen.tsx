import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
// Camera is used for Flashlight (torch)
import { Camera } from 'expo-camera';

import Compass from '../components/Compass';

export default function WelcomeScreen() {
    const navigation = useNavigation();

    // State
    const [time, setTime] = useState(new Date());
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    // Colors
    const textColor = '#FFFFFF';
    const accentColor = '#8B9C9A';

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Battery
    useEffect(() => {
        const getBattery = async () => {
            const level = await Battery.getBatteryLevelAsync();
            setBatteryLevel(Math.round(level * 100));
        };
        getBattery();
        const batterySub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
            setBatteryLevel(Math.round(batteryLevel * 100));
        });
        return () => batterySub && batterySub.remove();
    }, []);

    // Camera Permission (for Torch)
    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const toggleTorch = () => {
        if (!hasPermission) {
            Alert.alert("Permission", "Camera permission needed for flashlight.");
            return;
        }
        setIsTorchOn(!isTorchOn);
    };

    const navigateToMap = (destination: string) => {
        // @ts-ignore - Parameters for Map Tab
        navigation.navigate('Map', { destination });
    };

    return (
        <View style={styles.container}>
            {/* Hidden Camera for Torch Control */}
            {isTorchOn && (
                <Camera
                    style={{ width: 1, height: 1, position: 'absolute' }}
                    flashMode={Camera.Constants.FlashMode.torch}
                />
            )}

            {/* Header Info */}
            <View style={styles.header}>
                <Text style={styles.clock}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <View style={styles.batteryContainer}>
                    <Ionicons name="battery-charging" size={24} color={accentColor} />
                    <Text style={styles.batteryText}>{batteryLevel !== null ? `${batteryLevel}%` : '--'}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.centerContent}>
                    <Text style={styles.title}>PITBIKΞ OS</Text>

                    <View style={styles.compassContainer}>
                        <Compass />
                    </View>

                    {/* Controls Grid */}
                    <View style={styles.grid}>
                        {/* Lamp Toggle */}
                        <TouchableOpacity style={[styles.card, isTorchOn && styles.cardActive]} onPress={toggleTorch}>
                            <Ionicons name={isTorchOn ? "flashlight" : "flashlight-outline"} size={32} color={isTorchOn ? '#002B36' : accentColor} />
                            <Text style={[styles.cardText, isTorchOn && { color: '#002B36' }]}>LAMP</Text>
                        </TouchableOpacity>

                        {/* Shortcut 1 */}
                        <TouchableOpacity style={styles.card} onPress={() => navigateToMap("Am Tälchen 15")}>
                            <Ionicons name="home" size={32} color={accentColor} />
                            <Text style={styles.cardText}>HOME</Text>
                            <Text style={styles.subText}>Am Tälchen 15</Text>
                        </TouchableOpacity>

                        {/* Shortcut 2 */}
                        <TouchableOpacity style={styles.card} onPress={() => navigateToMap("Work")}>
                            <Ionicons name="briefcase" size={32} color={accentColor} />
                            <Text style={styles.cardText}>WORK</Text>
                        </TouchableOpacity>

                        {/* Settings Shortcut */}
                        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Settings')}>
                            <Ionicons name="settings" size={32} color={accentColor} />
                            <Text style={styles.cardText}>SETUP</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#002B36', // Dark Theme enforced for Dashboard
        paddingTop: Platform.OS === 'android' ? 40 : 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20
    },
    clock: {
        fontSize: 48,
        fontWeight: '200',
        color: '#fff',
        fontVariant: ['tabular-nums']
    },
    batteryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 8,
        borderRadius: 12
    },
    batteryText: {
        color: '#fff',
        fontSize: 18,
        marginLeft: 5,
        fontWeight: 'bold'
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center'
    },
    centerContent: {
        alignItems: 'center',
        width: '100%',
        paddingBottom: 40
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#fff',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 20
    },
    compassContainer: {
        marginBottom: 40,
        transform: [{ scale: 0.8 }]
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
        width: '100%',
        paddingHorizontal: 20
    },
    card: {
        width: '45%',
        aspectRatio: 1.2,
        backgroundColor: 'rgba(139, 156, 154, 0.15)', // Muted teal bg
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(139, 156, 154, 0.3)'
    },
    cardActive: {
        backgroundColor: '#8B9C9A', // Active state
    },
    cardText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 10,
        letterSpacing: 1
    },
    subText: {
        color: '#aaa',
        fontSize: 10,
        marginTop: 2
    }
});
