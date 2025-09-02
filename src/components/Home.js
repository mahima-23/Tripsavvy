import React, { useEffect, useState, createRef } from "react";
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import {ThemeProvider, createTheme} from '@mui/material/styles';

import getPlacesData from "../api/index";

import Header from "../components/Header/Header";
import List from "../components/List/List";
import Map from "../components/Map/Map";
import axios from 'axios'
import { useLocation, useNavigate } from "react-router-dom";

const Home = () => {
    const [places, setPlaces] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [bounds, setBounds] = useState({});
    const [clickedMarker, setClickedMarker] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [type, setType] = useState("restaurants");
    const [rating, setRating] = useState("");
    const geocoderContainerRef = createRef();
    const [mode, setMode] = React.useState('light');
    
    const loc = useLocation();
    const navigate = useNavigate();
    
    // Safely access state with fallback values
    const email = loc.state && loc.state.email ? loc.state.email : '';
    const password = loc.state && loc.state.password ? loc.state.password : '';
    
    // Redirect to login if no user data is available
    useEffect(() => {
        if (!loc.state || !loc.state.email) {
            console.log('No user data found, redirecting to login...');
            navigate('/');
            return;
        }
    }, [loc.state, navigate]);

    const theme = createTheme({
        palette: {
            mode: mode
        }
    });

    useEffect(() => {
        // Only fetch data if bounds are available and user is authenticated
        if (!bounds.ne || !bounds.sw || !email) {
            return;
        }

        setIsLoading(true);

        let CancelToken = axios.CancelToken;
        let source = CancelToken.source();

        getPlacesData(type, bounds.ne, bounds.sw, source)
            .then((data) => {
                if (data !== undefined) {
                    setPlaces(data);
                    setFilteredPlaces([]);
                    setRating("");
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                if (!axios.isCancel(error)) {
                    console.error('Error fetching places:', error);
                    setIsLoading(false);
                }
            });

        return () => source.cancel('Cancelled due to new request coming in');
    }, [type, bounds, email]);

    useEffect(() => {
        const filtered = places.filter(place => Number(place.rating) > Number(rating));
        setFilteredPlaces(filtered);
    }, [rating, places]); // Added 'places' to dependency array

    // Don't render if no user data
    if (!loc.state || !loc.state.email) {
        return <div>Loading...</div>;
    }

    return (
        <ThemeProvider theme={theme}>
            <div>
                <CssBaseline/>
                <Header containerRef={geocoderContainerRef} mode={mode} setMode={setMode}/>
                <Grid container>
                    <Grid item xs={12} md={4}>
                        <List
                            places={filteredPlaces.length ? filteredPlaces : places}
                            clickedMarker={clickedMarker}
                            isLoading={isLoading}
                            type={type}
                            setType={setType}
                            rating={rating}
                            setRating={setRating}
                            email={email}
                            password={password}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Map
                            setBounds={setBounds}
                            places={filteredPlaces.length ? filteredPlaces : places}
                            setClickedMarker={setClickedMarker}
                            containerRef={geocoderContainerRef}
                            mode={mode}
                        />
                    </Grid>
                </Grid>
            </div>
        </ThemeProvider>
    );
};

export default Home;