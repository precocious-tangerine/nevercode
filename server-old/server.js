'use strict';
let express = require('express');
let app = express();
let mongoose = require('mongoose');
let config = require('./config.js');

mongoose.connect(config.mongodbHost + config.mongodbPort + config.mongodbName);

require(__dirname + '/config/middleware.js')(app, express);
require(__dirname + '/config/routes.js')(app, express);
const port = process.env.PORT || 3000;


const startServer = () => {
  console.log(`server running on port ${port} in ${process.env.NODE_ENV} mode`);
  app.listen(port);
};
  // export our app for testing and flexibility, required by index.js
module.exports = startServer;