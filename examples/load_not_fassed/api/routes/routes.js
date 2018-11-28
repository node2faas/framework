'use strict';
module.exports = function(app) {
  var api = require('../controllers/load');

  app.route('/mem_load')
    .get(api.mem_load)

  app.route('/cpu_load')
    .get(api.cpu_load)

  app.route('/io_load')
    .get(api.io_load)
   
}

