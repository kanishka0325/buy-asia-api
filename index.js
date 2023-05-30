require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./src/config');
const routeHandler = require('./src/routes');
const requestLogger = require('./src/middlewares/request_logger');
const apiErrorHandler = require('./src/error');
const { loggerExtend } = require('./src/utils/logger');

const app = express();
app.use(cors({ exposedHeaders: ['x-authToken', 'document', 'user', 'invoice'] }));
app.use(requestLogger);

app.use(bodyParser.json());

app.use('/api', routeHandler(config));
app.use(apiErrorHandler);

mongoose
  .connect(process.env.DB_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => loggerExtend.info('Connected to mongodb'))
  .catch((err) => loggerExtend.error('Getting error with: ', err));

const listner = app.listen(process.env.PORT || 4000, () => {
  loggerExtend.info(`Listening on port ${listner.address().port}`);
});

app.all('*', (req, res) => {
  res.status(404).send({
    error: 'Sorry! This resource not found! testing new cicd pipeline',
  });
});

// process.on('uncaughtException', (error) => {
//   logger.error(error.message);
//   process.exit(1);
// });
