const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const bodyParser = require('body-parser');
// const db = require('./db');

const healthcheckApi = require('./src/api/healthcheck');
const steamApi = require('./src/api/steam');

const PORT = process.env.PORT || 3011;

const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json({ extended: true }));
app.use(bodyParser.json());

app.use('/api/v1/healthcheck', healthcheckApi);
app.use('/api/v1/steam', steamApi);

// db.testConnection()
//   .then(() => db.sequelize.sync())
//   .then(
//     app.listen(PORT, () => {
//       console.log(`Server listening on ${PORT}`);
//     }),
//   );

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
