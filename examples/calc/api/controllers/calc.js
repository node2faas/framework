'use strict';

exports.soma = function(req, res) {
  var a = 1;
  var b = 2;
  var result = a + b;
  res.json(result);
  return result;
} ;
