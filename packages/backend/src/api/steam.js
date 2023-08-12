const express = require('express');
const passport = require('passport');
const axios = require('axios');


const { STEAM_API_KEY } = process.env;
const CSGO_GAME_ID = '730';

const router = express.Router();

router.get('/items/:id64', async (req, res) => {
  const { id64 } = req.params;
  try {
    const response = await axios.get(`https://steamcommunity.com/inventory/${id64}/730/2`);
    return res.json(response.data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Error fetching Steam inventory' });
  }
});

router.get('/find-user-id/:steamUsername', async (req, res) => {
  const { steamUsername } = req.params;

  try {
    const response = await axios.get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${steamUsername}`);
    const steamID = response.data.response.steamid;
    return res.json({ steamID });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ error: 'Error fetching Steam inventory' });
  }
});

module.exports = router;
