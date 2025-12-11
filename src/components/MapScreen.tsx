import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

// Initialize MapLibre
MapLibreGL.setAccessToken(null);

// Types
type RouteStep = {
    maneuver: { type: string; modifier?: string; location: [number, number] };
    name: string;
    distance: number; // meters
    duration: number; // seconds
};

export default function MapScreen() {
    const route = useRoute();
    const navigation = useNavigation();

    // State
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [routeCoords, setRouteCoords] = useState<any>(null); // GeoJSON LineString
    const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
    const [steps, setSteps] = useState<RouteStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isNavigating, setIsNavigating] = useState(false);

    // UI State
    const [widgetMode, setWidgetMode] = useState<'search' | 'preview' | 'navigating'>('search');

    const cameraRef = useRef<MapLibreGL.Camera>(null);

    // Initial Location & Params handling
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);

            // Handle shortcut params from Home
            const params = route.params as any;
            if (params?.destination) {
                setSearchQuery(params.destination);
            }
        })();
    }, [route.params]);

    // --- Logic ---

    const handleGeocodeAndRoute = async () => {
        if (!location || !searchQuery) return;
        Keyboard.dismiss();
        setIsSearching(true);

        try {
            // 1. Geocode (Nominatim)
            const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;
            const geocodeRes = await fetch(geocodeUrl, { headers: { 'User-Agent': 'BikeOS/2.0' } });
            const geocodeData = await geocodeRes.json();

            if (!geocodeData || geocodeData.length === 0) {
                alert('Location not found');
                setIsSearching(false);
                return;
            }

            const destLat = parseFloat(geocodeData[0].lat);
            const destLon = parseFloat(geocodeData[0].lon);

            // 2. Route (OSRM)
            const startLon = location.coords.longitude;
            const startLat = location.coords.latitude;

            const routerUrl = `http://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${destLon},${destLat}?overview=full&geometries=polyline&steps=true`;
            const routerRes = await fetch(routerUrl);
            const routerData = await routerRes.json();

            if (routerData.code !== 'Ok') {
                alert('Could not calculate route');
                setIsSearching(false);
                return;
            }

            const route = routerData.routes[0];
            const geometry = route.geometry; // Polyline string

            // Decode polyline to coordinates
            const decodedPoints = polyline.decode(geometry); // returns [lat, lon]
            const geojsonCoords = decodedPoints.map(p => [p[1], p[0]]); // convert to [lon, lat] for GeoJSON

            // Update State
            setRouteCoords({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: geojsonCoords,
                },
            });
            setRouteInfo({ distance: route.distance, duration: route.duration });
            setSteps(route.legs[0].steps);
            setWidgetMode('preview');

            // Zoom to fit route
            // Naive approach: fly to destination or center
            cameraRef.current?.fitBounds(
                [startLon, startLat],
                [destLon, destLat],
                [50, 50, 50, 50], // padding
                1000
            );

        } catch (e) {
            console.error(e);
            alert('Error searching');
        } finally {
            setIsSearching(false);
        }
    };

    const startNavigation = () => {
        setWidgetMode('navigating');
        setIsNavigating(true);
        setCurrentStepIndex(0);

        // Tilt camera for 3D view
        if (location) {
            cameraRef.current?.setCamera({
                centerCoordinate: [location.coords.longitude, location.coords.latitude],
                zoomLevel: 18,
                pitch: 60,
                animationDuration: 2000
            });
        }
    };

    const stopNavigation = () => {
        setIsNavigating(false);
        setWidgetMode('search');
        setRouteCoords(null);
        setSearchQuery('');

        // Reset Camera
        if (location) {
            cameraRef.current?.setCamera({
                pitch: 0,
                zoomLevel: 14,
                animationDuration: 1000
            });
        }
    };

    // --- Render Helpers ---

    const formatDist = (meters: number) => {
        if (meters > 1000) return `${(meters / 1000).toFixed(1)} km`;
        return `${Math.round(meters)} m`;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.round(seconds / 60);
        if (mins > 60) {
            const hrs = Math.floor(mins / 60);
            return `${hrs}h ${mins % 60}min`;
        }
        return `${mins} min`;
    };

    return (
        <View style={styles.container}>
            <MapLibreGL.MapView
                style={styles.map}
                styleURL={MapLibreGL.StyleURL.Empty}
                logoEnabled={false}
                attributionEnabled={false}
            >
                <MapLibreGL.Camera
                    ref={cameraRef}
                    zoomLevel={14}
                    centerCoordinate={location ? [location.coords.longitude, location.coords.latitude] : [-122.4324, 37.78825]}
                    animationMode={'flyTo'}
                    animationDuration={1000}
                    followingUserMode={isNavigating ? 'course' : undefined}
                />

                {/* Esri Tiles */}
                <MapLibreGL.RasterSource
                    id="esri-topo"
                    tileUrlTemplates={["https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"]}
                    tileSize={256}
                >
                    <MapLibreGL.RasterLayer id="esri-topo-layer" sourceID="esri-topo" />
                </MapLibreGL.RasterSource>

                {/* Route Line */}
                {routeCoords && (
                    <MapLibreGL.ShapeSource id="routeSource" shape={routeCoords}>
                        <MapLibreGL.LineLayer
                            id="routeFill"
                            style={{
                                lineColor: '#002B36',
                                lineWidth: 6,
                                lineCap: 'round',
                                lineJoin: 'round',
                                lineOpacity: 0.8
                            }}
                        />
                    </MapLibreGL.ShapeSource>
                )}

                {/* User Location */}
                {location && <MapLibreGL.UserLocation visible={true} showsUserHeadingIndicator={true} />}

            </MapLibreGL.MapView>

            {/* --- NAV WIDGET (Draggable placeholder logic, simplified to Top Bar) --- */}
            {/* User asked for "Draggable in settings tab" but also "top of map".
                I'll put it at the top as a floating card. handling true Drag gesture 
                competes with Map pan, so a fixed Floating Widget is standard UX. 
            */}

            {/* NAVIGATING HUD */}
            {widgetMode === 'navigating' && steps[currentStepIndex] && (
                <View style={styles.navHud}>
                    <View style={styles.turnIndicator}>
                        <Ionicons name="arrow-up" size={40} color="#fff" />
                    </View>
                    <View style={styles.turnInfo}>
                        <Text style={styles.navDist}>{formatDist(steps[currentStepIndex].distance)}</Text>
                        <Text style={styles.navText} numberOfLines={2}>
                            {steps[currentStepIndex].maneuver.type} {steps[currentStepIndex].maneuver.modifier} {steps[currentStepIndex].name}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={stopNavigation} style={styles.stopBtn}>
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}

            {/* SEARCH / PREVIEW WIDGET */}
            {widgetMode !== 'navigating' && (
                <View style={styles.searchWidget}>
                    {widgetMode === 'search' ? (
                        <>
                            <View style={styles.inputContainer}>
                                <Ionicons name="search" size={20} color="#8B9C9A" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Where to?"
                                    placeholderTextColor="#8B9C9A"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={handleGeocodeAndRoute}
                                />
                            </View>
                            {isSearching && <ActivityIndicator color="#002B36" style={{ marginTop: 10 }} />}
                            {searchQuery.length > 0 && !isSearching && (
                                <TouchableOpacity style={styles.actionBtn} onPress={handleGeocodeAndRoute}>
                                    <Text style={styles.actionBtnText}>Navigieren (Route)</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        // PREVIEW MODE
                        <>
                            <View style={styles.previewInfo}>
                                <View>
                                    <Text style={styles.previewTitle}>{searchQuery}</Text>
                                    <Text style={styles.previewSub}>
                                        {routeInfo && `${formatDist(routeInfo.distance)} • ${formatTime(routeInfo.duration)}`}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setWidgetMode('search')} style={{ padding: 5 }}>
                                    <Ionicons name="close-circle" size={24} color="#555" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.startBtn} onPress={startNavigation}>
                                <Ionicons name="navigate" size={24} color="#fff" style={{ marginRight: 10 }} />
                                <Text style={styles.startBtnText}>START NAVIGATION</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },

    // Search / Preview Widget
    searchWidget: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 15,
        padding: 15,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 45
    },
    input: {
        flex: 1,
        marginLeft: 10,
        color: '#002B36',
        fontWeight: 'bold'
    },
    actionBtn: {
        marginTop: 10,
        backgroundColor: '#002B36',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center'
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: 'bold'
    },

    // Preview
    previewInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002B36'
    },
    previewSub: {
        color: '#555',
        marginTop: 2
    },
    startBtn: {
        backgroundColor: '#8B9C9A', // Brand Light
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5
    },
    startBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1
    },

    // HUD
    navHud: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#002B36',
        paddingTop: 50, // Status bar
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 10
    },
    turnIndicator: {
        marginRight: 15
    },
    turnInfo: {
        flex: 1
    },
    navDist: {
        color: '#8B9C9A',
        fontSize: 24,
        fontWeight: 'bold'
    },
    navText: {
        color: '#fff',
        fontSize: 16
    },
    stopBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 10,
        borderRadius: 50
    }
});
