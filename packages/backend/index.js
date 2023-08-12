const express = require('express');
const cors = require('cors');
const passport = require('passport');
const logger = require('morgan');
// const db = require('./db');

const healthcheckApi = require('./src/api/healthcheck');

const PORT = process.env.PORT || 3011;

const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json({ extended: true }));
app.use(passport.initialize());

app.use('/api/v1/healthcheck', healthcheckApi);

// db.testConnection()
//   .then(() => db.sequelize.sync())
//   .then(
//     app.listen(PORT, () => {
//       console.log(`Server listening on ${PORT}`);
//     }),
//   );

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
})