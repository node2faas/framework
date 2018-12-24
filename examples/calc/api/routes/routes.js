'use strict';
//@node2faas-skip
module.exports = function(app) {
  var apicalc = require('../controllers/calc');

  app.route('/soma/:a/:b')
    .get(apicalc.soma)

  app.route('/subtrai/:a/:b')
    .get(apicalc.subtrai)

  app.route('/multiplica/:a/:b')
    .get(apicalc.multiplica)

  app.route('/divide/:a/:b')
    .get(apicalc.divide)

  app.route('/fatorial/:a')
    .get(apicalc.fatorial)
}

