'use strict';
module.exports = function(app) {
  var apicalc = require('../controllers/calc');

  app.route('/mem_load')
    .get(apicalc.mem_load)

  app.route('/cpu_load')
    .get(apicalc.mem_load)

  app.route('/io_load')
    .get(apicalc.io_load)
   
}

