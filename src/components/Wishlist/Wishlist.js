import './wishlist.css';
import React from "react";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { useLocation } from "react-router-dom";

const Wishlist = () => {
    const [info, setInfo] = useState([]);
    const db = getFirestore();
    const loc = useLocation();
    let email = loc.state.email;
    
    const fetchBlogs = async () => {
        const q = query(collection(db, "Wishlist"), where("Email", "==", email));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            setInfo(arr => [...arr, doc.data()]);
        });
    }
    
    useEffect(() => {
        console.log("fetching");
        fetchBlogs();
    }, []);
    
    console.log("data", info);

    return (
        <div>
            <center>
                <h2>WISHLIST</h2>
            </center>
          
            {
                info.map((data, index) => (
                    <Frame 
                        key={index}
                        name={data.Name} 
                        rating={data.Rating}
                        timestamp={data.timestamp}
                    />
                ))
            }
        </div>
    );
}

const Frame = ({ name, rating, timestamp }) => {
    console.log(name + " " + rating);
    
    return (
        <center>
            <div className="wish">
                <p>NAME: {name}</p>
                <p>RATING: {rating}</p>
            </div>
        </center>
    );
}

export default Wishlist;