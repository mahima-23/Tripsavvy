import axios from "axios";

// import data from "./data"

const getPlacesData = async (type, ne, sw, source) => {
    try {
        const { data: { data } } = await axios.get(`https://travel-advisor.p.rapidapi.com/${type}/list-in-boundary`, {
            params: {
                bl_latitude: sw.lat,
                tr_latitude: ne.lat,
                bl_longitude: sw.lng,
                tr_longitude: ne.lng
            },
            headers: {
                'x-rapidapi-host': 'travel-advisor.p.rapidapi.com',
                'x-rapidapi-key': 'ad42fcaf97msh2484634d225eac5p188541jsn327b73525c3a'
            },
            cancelToken: source.token
        });

        return data;
    } catch (err) {
        if (axios.isCancel(err)) {
            console.log("cancelled request");
        } else {
            console.error("Error fetching places data:", err);
        }
    }
}

export default getPlacesData;