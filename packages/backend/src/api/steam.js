const express = require('express');
const axios = require('axios');

const steamTradesDomain = require('../domain/steamTrades');

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

// eslint-disable-next-line consistent-return
router.post('/inventory', (req, res) => {
  const { tradeUrl } = req.body;

  if (!tradeUrl) {
    return res.status(400).json({ error: 'Missing tradeUrl' });
  }

  const steamIDRegex = /partner=(\d+)&/i;
  const match = tradeUrl.match(steamIDRegex);

  if (!match || !match[1]) {
    return res.status(400).send('Invalid trade URL provided.');
  }

  const steamID = steamTradesDomain.convertToSteamId(match[1]);

  // Fetch the inventory for the given Steam ID
  steamTradesDomain.community.getUserInventoryContents(steamID, 730, 2, true, (err, inventory) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error retrieving inventory. Please try again later.');
    }

    return res.json(inventory);
  });
});

// eslint-disable-next-line consistent-return
router.post('/init-trade', (req, res) => {
  const { tradeURL, itemIds, walletAddress } = req.body;

  if (!tradeURL || !itemIds || itemIds.length === 0) {
    return res.status(400).send({ error: 'Missing tradeURL or items.' });
  }

  const offer = steamTradesDomain.manager.createOffer(tradeURL);
  itemIds.forEach((id) => {
    offer.addTheirItem({ appid: CSGO_GAME_ID, contextid: '2', assetid: id });
  });
  offer.setMessage(`Asset will be sent to: ${walletAddress}`);

  offer.send((err, status) => {
    if (err) {
      console.error(`Error sending offer: ${err.message}`);
      return res.status(500).send({ error: 'Error sending offer.' });
    }
    return res.json({ message: `Offer sent with status: ${status}` });
  });
});

module.exports = router;
