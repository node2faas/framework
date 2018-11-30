'use strict';

exports.mem_load = function(req, res) {
  var url ='https://7wywe5pgv1.execute-api.us-east-1.amazonaws.com/default/node2faas-lab-mem-load'
  var request = require('request');
  request(url, function (error, response, body) {
    res.json(body); 
  });
};

exports.cpu_load = function(req, res) {
  var url ='https://dcysuxxxv8.execute-api.us-east-1.amazonaws.com/default/node2faas-lab-cpu-load'
  var request = require('request');
  request(url, function (error, response, body) {
    res.json(body); 
  });
};


exports.io_load = function(req, res) {
  var url ='https://lg2ot5zexj.execute-api.us-east-1.amazonaws.com/default/node2faas-lab-io-load'
  var request = require('request');
  request(url, function (error, response, body) {
    res.json(body); 
  });
};

exports.simple_load = function(req, res) {
  var url ='https://yusmnnj2hl.execute-api.us-east-1.amazonaws.com/default/node2fass-lab-simple-load'
  var request = require('request');
  request(url, function (error, response, body) {
    res.json(body); 
  });
};
