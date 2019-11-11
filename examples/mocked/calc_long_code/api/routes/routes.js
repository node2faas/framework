'use strict';
//@node2faas-skip
module.exports = function(app) {
  var apicalc = require('../controllers/calc');

  app.route('/sum/:a/:b')
    .get(apicalc.sum)

  app.route('/subtraction/:a/:b')
    .get(apicalc.subtraction)

  app.route('/matrix/')
    .get(apicalc.matrix)

  app.route('/multiplication/:a/:b')
    .get(apicalc.multiplication)

  app.route('/division/:a/:b')
    .get(apicalc.division)

}
