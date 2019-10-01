'use strict';

exports.soma = function(req, res) {
  var result = req.params.a + req.params.b
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

exports.fatorial = function(req, res) {
  var fat = function fatorial_n(n) {
    if (n == 1){
      return 1;
    } else {
      var anterior = n-1;
      return n * fatorial_n(anterior);
    }
  }
  res.json(fat(req.params.a));
};

//Coments 5
