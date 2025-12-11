import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                mapType="none" // Disable standard map to show only tiles
                showsUserLocation={true}
                showsMyLocationButton={true}
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <UrlTile
                    /**
                     * OpenTopoMap Tiles
                     * Attribution: Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)
                     */
                    urlTemplate="https://a.tile.opentopomap.org/{z}/{x}/{y}.png"
                    maximumZ={17}
                    flipY={false}
                />
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title={"You are here"}
                    />
                )}
            </MapView>
            {errorMsg && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            )}
            <View style={styles.attribution}>
                <Text style={styles.attributionText}>© OpenTopoMap (CC-BY-SA)</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    errorContainer: {
        position: 'absolute',
        bottom: 80,
        backgroundColor: 'rgba(255,0,0,0.7)',
        padding: 10,
        borderRadius: 10
    },
    errorText: {
        color: 'white',
        fontWeight: 'bold'
    },
    attribution: {
        position: 'absolute',
        bottom: 20,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: 2,
        borderRadius: 5
    },
    attributionText: {
        fontSize: 10,
        color: 'black'
    }
});
