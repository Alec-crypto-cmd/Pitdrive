import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';

// Initialize MapLibre (no implementation needed usually, but good practice if setting access tokens, which we don't have)
MapLibreGL.setAccessToken(null);

export default function MapScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            setPermissionGranted(true);
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    return (
        <View style={styles.container}>
            <MapLibreGL.MapView
                style={styles.map}
                styleURL={MapLibreGL.StyleURL.Empty} // Start with empty style to avoid default vector tiles if any
                logoEnabled={false}
                attributionEnabled={false} // We add custom attribution for OpenTopoMap
            >
                <MapLibreGL.Camera
                    zoomLevel={12}
                    centerCoordinate={location ? [location.coords.longitude, location.coords.latitude] : [-122.4324, 37.78825]}
                    animationMode={'flyTo'}
                    animationDuration={2000}
                />

                {/* User Location */}
                {permissionGranted && (
                    <MapLibreGL.UserLocation visible={true} showsUserHeadingIndicator={true} />
                )}

                {/* OpenTopoMap Source & Layer */}
                <MapLibreGL.RasterSource
                    id="opentopomap"
                    tileUrlTemplates={["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"]}
                    tileSize={256}
                >
                    <MapLibreGL.RasterLayer
                        id="opentopomap-layer"
                        sourceID="opentopomap"
                        style={{ rasterOpacity: 1 }}
                    />
                </MapLibreGL.RasterSource>

            </MapLibreGL.MapView>

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
