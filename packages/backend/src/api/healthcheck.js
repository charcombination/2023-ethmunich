const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/', async (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
