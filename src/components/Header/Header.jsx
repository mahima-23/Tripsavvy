import React from "react";
import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import useStyles from "./styles";

import { useUserAuth } from "../../context/UserAuthContext";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";

const Header = ({ containerRef, mode, setMode, props }) => {
    
    const classes = useStyles();

    const { logOut, user } = useUserAuth();
    const navigate = useNavigate();
    const handleLogout = async () => {
      try {
        await logOut();
        navigate("/");
      } catch (error) {
        console.log(error.message);
      }
    };
  
    return (
        <AppBar position="static">
            <Toolbar className={classes.toolbar}>
                <Typography variant="h5" className={classes.title}>
                    Travel Advisor
                </Typography>
                <Box display="flex">
                    <div className={classes.search}>
                        <div ref={containerRef} />
                    </div>
                    <div>
                        {mode} mode
                        <IconButton
                            sx={{ ml: 1 }}
                            onClick={() => setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))}
                            color="inherit"
                        >
                            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                        </IconButton>
                    </div>
                    
                    <Button variant="primary" onClick={handleLogout}>
                        Log out
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;