'use strict';







exports.cpu = function(req,res){
  /**** Function converted by Node2FaaS ****/
  let stringParam = '';
  if( req.params !== undefined ){
  for (var i in req.params){
    stringParam += "&"+i+"="+req.params[i];
  }
}
if( res.params !== undefined ){
  for (var i in res.params){
    stringParam += "&"+i+"="+res.params[i];
  }
}

  let uri = "https://us-central1-node2faas-248113.cloudfunctions.net/node2faas-node2faas-248113-cpu"+"?n=y"+stringParam;
	let request = require('request');
	request(uri, function (error, response, body) {
    if (error){
       res.json(error);
    } else {
    	res.json(body);
    }
  });
};

exports.memory = function(req,res){
  /**** Function converted by Node2FaaS ****/
  let stringParam = '';
  if( req.params !== undefined ){
  for (var i in req.params){
    stringParam += "&"+i+"="+req.params[i];
  }
}
if( res.params !== undefined ){
  for (var i in res.params){
    stringParam += "&"+i+"="+res.params[i];
  }
}

  let uri = "https://us-central1-node2faas-248113.cloudfunctions.net/node2faas-node2faas-248113-memory"+"?n=y"+stringParam;
	let request = require('request');
	request(uri, function (error, response, body) {
    if (error){
       res.json(error);
    } else {
    	res.json(body);
    }
  });
};

exports.io = function(req,res){
  /**** Function converted by Node2FaaS ****/
  let stringParam = '';
  if( req.params !== undefined ){
  for (var i in req.params){
    stringParam += "&"+i+"="+req.params[i];
  }
}
if( res.params !== undefined ){
  for (var i in res.params){
    stringParam += "&"+i+"="+res.params[i];
  }
}

  let uri = "https://us-central1-node2faas-248113.cloudfunctions.net/node2faas-node2faas-248113-io"+"?n=y"+stringParam;
	let request = require('request');
	request(uri, function (error, response, body) {
    if (error){
       res.json(error);
    } else {
    	res.json(body);
    }
  });
};
