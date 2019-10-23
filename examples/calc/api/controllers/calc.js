'use strict';

exports.soma = function(req, res) {
  var a = 1;
  var b = 2;
  var result = a + b;
  res.json(result);
  return result;
} ;

exports.subtrai = function(req, res) {
  var a = 10;
  var b = 1;
  var result = a - b;
  res.json(result);
  return result;
} ;
