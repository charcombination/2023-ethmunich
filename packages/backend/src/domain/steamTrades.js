const path = require('path');

const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const { STEAM_USERNAME, STEAM_PASSWORD } = process.env;

const logonOptions = {
  accountName: STEAM_USERNAME,
  password: STEAM_PASSWORD,
};

const client = new SteamUser({
  dataDirectory: path.join(__dirname, './data'),
  autoRelogin: true,
});
const community = new SteamCommunity();
const manager = new TradeOfferManager({
  steam: client,
  community,
  language: 'en',
});

const mintNFT = (userAddress) => {
  console.log(`minting NFT for ${userAddress}`);
};

const finalizeTrade = (offer) => {
  // Extract the interaction ID from the trade message
  const interactionID = offer.message;
  // Stub for NFT minting logic
  mintNFT(interactionID);
};

client.logOn(logonOptions);

client.on('loggedOn', () => {
  console.log('Logged into Steam successfully.');
});

client.on('webSession', (sessionid, cookies) => {
  manager.setCookies(cookies);
  community.setCookies(cookies);
});

// eslint-disable-next-line no-unused-vars
manager.on('receivedOfferChanged', (offer, oldState) => {
  if (offer.state === TradeOfferManager.ETradeOfferState.Accepted) {
    // When the trade offer has been accepted, execute some further logic.
    finalizeTrade(offer);
  }
});

manager.on('newOffer', (offer) => {
  if (offer.itemsToGive.length === 0 && offer.message.startsWith('INTERACTION_ID')) {
    offer.accept((err) => {
      if (!err) {
        const userAddress = offer.message.split(':')[1].trim();
        mintNFT(userAddress);
      }
    });
  }
});

module.exports = {
  client, manager,
};
