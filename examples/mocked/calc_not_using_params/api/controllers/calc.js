'use strict';

//Coments before sum

exports.sum = function(req, res) {
  var result = 1 + 1;
  res.json(result);
} ;

//Coments before subtraction

exports.subtraction = function(req, res) {
  var result = 3 - 1
  res.json(result);
};

//Coments before multiplication

exports.multiplication = function(req, res) {
  var result = 2 * 2
  res.json(result);
};

//Coments before division

exports.division = function(req, res) {
  var result = 20 / 2
  res.json(result);
};

//Coments after division
