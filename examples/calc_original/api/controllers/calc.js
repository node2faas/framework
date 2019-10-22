'use strict';

exports.soma = function(req, res) {
  var result = req.params.a + req.params.b;
  res.json(result);
} ;

//Coments 1

exports.subtrai = function(req, res) {
  var result = req.params.a - req.params.b
  res.json(result);
};

//Coments 2

exports.multiplica = function(req, res) {
  var result = req.params.a * req.params.b
  res.json(result);
};

//Coments 3

exports.divide = function(req, res) {
  var result = req.params.a / req.params.b
  res.json(result);
};

//Coments 4
