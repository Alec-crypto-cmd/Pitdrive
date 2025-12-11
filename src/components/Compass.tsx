import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Magnetometer } from 'expo-sensors';

export default function Compass() {
    const [subscription, setSubscription] = useState<any>(null);
    const [magnetometer, setMagnetometer] = useState(0);

    useEffect(() => {
        _subscribe();
        return () => _unsubscribe();
    }, []);

    const _subscribe = () => {
        setSubscription(
            Magnetometer.addListener((data) => {
                setMagnetometer(_angle(data));
            })
        );
        // Set update interval to smoothen movement
        Magnetometer.setUpdateInterval(100);
    };

    const _unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    };

    const _angle = (magnetometer: any) => {
        let angle = 0;
        if (magnetometer) {
            let { x, y } = magnetometer;
            if (Math.atan2(y, x) >= 0) {
                angle = Math.atan2(y, x) * (180 / Math.PI);
            } else {
                angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
            }
        }
        return Math.round(angle);
    };

    // 0 degrees (North) matches 90 in typical math (atan2), let's adjust visually.
    // Actually, atan2(y,x) gives angle from X axis.
    // Standard Compass: 0 at top (North).
    // x is sideways, y is vertical phone axis.
    // Let's rely on standard calculation: angle - 90 to match UI rotation?
    // We will pass the raw angle and rotate the UI element.
    // Compass needle points North. If phone rotates, North stays.
    // UI Rotation = 360 - magnetAngle? Or similar.
    // Let's test standard Rotation: -angle.

    const _degree = (magnetometer: number) => {
        return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.northText}>N</Text>
            <View style={[styles.arrowContainer, { transform: [{ rotate: `${360 - magnetometer}deg` }] }]}>
                <View style={styles.triangle} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
        width: 150,
    },
    northText: {
        position: 'absolute',
        top: 0,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18
    },
    arrowContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        width: 100,
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderBottomWidth: 50,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'red', // North needle
        marginBottom: 50 // Center rotation
    },
});
