import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function StatsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Stats</Text>
            <Text>Coming Soon</Text>
        </View>
    );
}

export function FriendsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Friends</Text>
            <Text>Coming Soon</Text>
        </View>
    );
}

export function SettingsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>PITBIKΞ OS Settings</Text>
            <Text>v2.0.0</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#002B36'
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8B9C9A',
        marginBottom: 10
    }
});
