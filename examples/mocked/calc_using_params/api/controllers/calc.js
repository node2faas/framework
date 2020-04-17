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
  var result = 1;
  for (var i in req.params){
    if (i == "a" || i == "b"){
      result *= req.params[i];
    }
  }
  res.json(result);
};

//Coments before division

exports.division = function(req, res) {
  var result = 20 / 2
  res.json(result);
};

//Coments after division

exports.situations = function(req, res) {
  var d1 = req; // Direct input
  var d2 = res; // Direct input
  var d3 = req + res; //sum or concatenation
  var d4 = req - res; //subtraction after or before
  var d5 = req * res; //multiplication after or before
  var d6 = req /res; //division after or before
  ////// Colocar regex com ;or\n+parametro+(alguma coisa)+;or\n
  var i1 = req.a ; // Indirect input
  var i2 = req.b   // Indirect input
  var i3 = req.a + res.b; //sum or concatenation
  var i4 = req.a - res.b; //subtraction after or before
  var i5 = req.a *res.a  //multiplication after or before
  var i6 = req.a / res.a; //division after or before
  //////
  var v1 = req[0] ; // Input from a Vector
  var v2 = req['a'] ; // Input from a Vector
  var v3 = req[0] + res[1]; //sum or concatenation
  var v4 = req[0] -res[1]  //subtraction after or before
  var v5 = req['a']* res[2]; //multiplication after or before
  var v6 = req['a'] / res[2]; //division after or before
  //////
  var iv1 = req[0].a ; // Indirect Input from a Vector
  var iv2 = req['a'].b ; //  Indirect Input from a Vector
  var iv3 = req[0].a + res[1].b; //sum or concatenation
  var iv4 = req[0].a -res[1].b  //subtraction after or before
  var iv5 = req['a'].a* res[2].b; //multiplication after or before
  var iv6 = req['a'].a / res[2].b; //division after or before
  // ...
};
