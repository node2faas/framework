'use strict';

exports.cpu = function(req, res) {
  var result = 0;
  for (var x in req.params){
    for (var i = 0; i < parseInt(req.params[x]); i++) {
      result = parseInt(result)*1 + parseInt(req.params[x])*1;
    }
  }
  res.json(result);
} ;

exports.memory = function(req, res) {
  var result = new Array();
  for (var x = 0; x < parseInt(req.params["a"]); x++) {
    result[x] = new Array();
    for (var i = 0; i < parseInt(req.params["b"]); i++) {
      result[x][i] = x+i;
    }
  }
  result = eval(result.join("+"));
  res.json(result);
};

exports.io = function(req, res) {
  var prefix = Math.floor(Math.random()*1000);
  var result = 0;
  const fs = require("fs");
  for (var x = 0; x < parseInt(req.params["a"]); x++) {
    for (var i = 0; i < parseInt(req.params["b"]); i++) {
      fs.writeFileSync("/tmp/"+prefix+x+i, "Node2FaaSTest", function(err) {
          if(err) {
              return console.log(err);
          }
          console.log("The file was saved!");
      });
      fs.unlinkSync("/tmp/"+prefix+x+i);
      result++;
    }
  }
  res.json(result);
};
