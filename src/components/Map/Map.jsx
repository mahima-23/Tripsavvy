import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import { Paper, Typography, useMediaQuery, Button, Alert, Box } from "@mui/material";
import Rating from "@mui/material/Rating";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import RefreshIcon from "@mui/icons-material/Refresh";

import MapGL, { GeolocateControl, Marker } from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";

import useStyles from "./styles";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGhhcndpbiIsImEiOiJja2lvbmExY3cwa2M2MnNveWNiZnlpczYzIn0.jIjFK42Gjc6lEFgbaFr3Ig';

const Map = ({ places, setBounds, setClickedMarker, containerRef, mode }) => {
    const classes = useStyles();
    const desktopScreen = useMediaQuery("(min-width:600px)");
    const [isGeolocationSupported, setIsGeolocationSupported] = useState(false);
    const [locationStatus, setLocationStatus] = useState('checking');

    const [viewport, setViewport] = useState({
        latitude: 19.0760,    // Mumbai latitude (fallback)
        longitude: 72.8777,   // Mumbai longitude (fallback)
        zoom: 12.303149558712713,
    });

    const mapRef = useRef();

    // Function to retry getting user location
    const retryLocation = useCallback(() => {
        if ('geolocation' in navigator) {
            setLocationStatus('checking');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setViewport(prev => ({
                        ...prev,
                        latitude,
                        longitude,
                        zoom: 14
                    }));
                    setLocationStatus('found');
                },
                (error) => {
                    setLocationStatus(error.code === 1 ? 'denied' : 'error');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 60000
                }
            );
        }
    }, []);

    // Location status indicator component
    const LocationStatusIndicator = () => {
        switch (locationStatus) {
            case 'checking':
                return (
                    <Box sx={{ position: 'absolute', top: 60, left: 10, zIndex: 1000 }}>
                        <Alert severity="info" icon={<MyLocationIcon />}>
                            Getting your location...
                        </Alert>
                    </Box>
                );
            case 'denied':
                return (
                    <Box sx={{ position: 'absolute', top: 60, left: 10, zIndex: 1000 }}>
                        <Alert 
                            severity="warning"
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    onClick={retryLocation}
                                    startIcon={<RefreshIcon />}
                                >
                                    Retry
                                </Button>
                            }
                        >
                            Location access denied. Using Mumbai as default.
                        </Alert>
                    </Box>
                );
            case 'found':
                return (
                    <Box sx={{ position: 'absolute', top: 60, left: 10, zIndex: 1000 }}>
                        <Alert severity="success" onClose={() => setLocationStatus('')}>
                            Found nearby places for your location!
                        </Alert>
                    </Box>
                );
            case 'error':
                return (
                    <Box sx={{ position: 'absolute', top: 60, left: 10, zIndex: 1000 }}>
                        <Alert 
                            severity="error"
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    onClick={retryLocation}
                                    startIcon={<RefreshIcon />}
                                >
                                    Try Again
                                </Button>
                            }
                        >
                            Could not get location. Using default.
                        </Alert>
                    </Box>
                );
            default:
                return null;
        }
    };

    // Check geolocation support and automatically request location on component mount
    useEffect(() => {
        const requestUserLocation = () => {
            if ('geolocation' in navigator && navigator.geolocation) {
                setIsGeolocationSupported(true);
                setLocationStatus('checking');
                
                // Automatically request user's current location
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log('Got user location:', { latitude, longitude });
                        setViewport(prev => ({
                            ...prev,
                            latitude,
                            longitude,
                            zoom: 14
                        }));
                        setLocationStatus('found');
                    },
                    (error) => {
                        console.warn('Location access denied or failed:', error.message);
                        setLocationStatus(error.code === 1 ? 'denied' : 'error');
                        // Keep Mumbai as fallback
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000, // 15 seconds timeout
                        maximumAge: 300000 // 5 minutes cache
                    }
                );
            } else {
                console.warn('Geolocation is not supported by this browser.');
                setIsGeolocationSupported(false);
                setLocationStatus('error');
            }
        };
        
        requestUserLocation();
    }, []);

    useEffect(() => {
        if (mapRef.current && mapRef.current.getMap) {
            try {
                const bounds = mapRef.current.getMap().getBounds();
                setBounds({
                    ne: bounds._ne,
                    sw: bounds._sw,
                });
            } catch (error) {
                console.error('Error getting map bounds:', error);
            }
        }
    }, [setBounds]);

    const handleViewportChange = useCallback((newViewport) => {
        setViewport(newViewport);
    }, []);

    const handleGeocoderViewportChange = useCallback((newViewport) => {
        const geocoderDefaultOverrides = { transitionDuration: 1000 };
        return handleViewportChange({
            ...newViewport,
            ...geocoderDefaultOverrides,
        });
    }, [handleViewportChange]);

    const handleTransitionEnd = useCallback(() => {
        if (mapRef.current && mapRef.current.getMap) {
            try {
                const bounds = mapRef.current.getMap().getBounds();
                setBounds({
                    ne: bounds._ne,
                    sw: bounds._sw,
                });
            } catch (error) {
                console.error('Error getting bounds on transition end:', error);
            }
        }
    }, [setBounds]);

    const markers = useMemo(
        () =>
            places?.map((place, i) => {
                if (!isNaN(place.longitude)) {
                    return (
                        <Marker
                            longitude={Number(place.longitude)}
                            latitude={Number(place.latitude)}
                            key={i}
                            className={classes.markerContainer}
                            offsetLeft={-20}
                            offsetTop={-10}
                            onClick={() => {
                                setClickedMarker(i);
                            }}
                        >
                            {!desktopScreen ? (
                                <LocationOnOutlinedIcon
                                    color="primary"
                                    fontSize="large"
                                />
                            ) : (
                                <Paper elevation={3} className={classes.paper}>
                                    <Typography
                                        className={classes.typography}
                                        variant="subtitle2"
                                        gutterBottom
                                    >
                                        {" "}
                                        {place.name}
                                    </Typography>
                                    <img
                                        className={classes.pointer}
                                        alt={place.name}
                                        src={
                                            place.photo
                                                ? place.photo.images.large.url
                                                : "https://jooinn.com/images/blur-restaurant-1.png"
                                        }
                                    />
                                    <Rating
                                        name="read-only"
                                        size="small"
                                        value={Number(place.rating)}
                                        readOnly
                                    />
                                </Paper>
                            )}
                        </Marker>
                    );
                } else {
                    return null;
                }
            }),
        [
            places,
            setClickedMarker,
            classes.markerContainer,
            classes.paper,
            classes.pointer,
            classes.typography,
            desktopScreen,
        ]
    );

    // Safe GeolocateControl component
    const SafeGeolocateControl = () => {
        if (!isGeolocationSupported) {
            return null;
        }

        try {
            return (
                <GeolocateControl
                    style={{ top: 10, right: 10 }}
                    positionOptions={{ enableHighAccuracy: true }}
                    trackUserLocation={true}
                    auto={false} // Keep manual to prevent errors
                    onGeolocate={(e) => {
                        // When user clicks geolocation, update viewport
                        const { longitude, latitude } = e.coords;
                        setViewport(prev => ({
                            ...prev,
                            latitude,
                            longitude,
                            zoom: 14
                        }));
                        setLocationStatus('found');
                    }}
                    onError={(error) => {
                        console.warn('Geolocation error:', error);
                        setLocationStatus('error');
                    }}
                />
            );
        } catch (error) {
            console.error('Error rendering GeolocateControl:', error);
            return null;
        }
    };

    return (
        <div className={classes.mapContainer} style={{ position: 'relative' }}>
            <LocationStatusIndicator />
            <MapGL
                ref={mapRef}
                {...viewport}
                width="100%"
                height="100%"
                onViewportChange={handleViewportChange}
                onTransitionEnd={handleTransitionEnd}
                mapboxApiAccessToken={MAPBOX_TOKEN}
                mapStyle={mode === 'light' ? "mapbox://styles/mapbox/streets-v11" : "mapbox://styles/mapbox/dark-v10"}
            >
                <Geocoder
                    mapRef={mapRef}
                    containerRef={containerRef}
                    onViewportChange={handleGeocoderViewportChange}
                    mapboxApiAccessToken={MAPBOX_TOKEN}
                    inputValue=""
                />
                <SafeGeolocateControl />
                {markers}
            </MapGL>
        </div>
    );
};

export default Map;