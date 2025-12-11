import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, Platform, StatusBar } from 'react-native';
import Compass from '../components/Compass';
import MapScreen from '../components/MapScreen';

export default function WelcomeScreen() {
    const [showMap, setShowMap] = useState(false);
    const colorScheme = useColorScheme();

    const isDarkMode = colorScheme === 'dark';

    // Custom Theme Colors
    const backgroundColor = isDarkMode ? '#002B36' : '#8B9C9A';
    const textColor = isDarkMode ? '#FFFFFF' : '#002B36'; // High contrast text

    if (showMap) {
        return (
            <View style={{ flex: 1 }}>
                <MapScreen />
                {/* Back button overlay */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setShowMap(false)}
                >
                    <Text style={styles.backButtonText}>Close Map</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={backgroundColor} />

            <View style={styles.content}>
                <Text style={[styles.title, { color: textColor }]}>PITBIKΞ OS</Text>

                <View style={styles.compassContainer}>
                    <Compass />
                </View>

                <TouchableOpacity
                    style={[styles.button, { borderColor: textColor }]}
                    onPress={() => setShowMap(true)}
                >
                    <Text style={[styles.buttonText, { color: textColor }]}>START NAVIGATION</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '60%',
        width: '100%'
    },
    title: {
        fontSize: 42,
        fontWeight: '900', // Ultra bold
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', // Techy font
    },
    compassContainer: {
        marginVertical: 40
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderWidth: 2,
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 8
    },
    backButtonText: {
        color: 'white',
        fontWeight: 'bold'
    }
});
