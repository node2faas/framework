'use strict';

exports.soma = function(req, res) {
  var result = req.params.a + req.params.b;
  res.json(result);
} ;
