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

  let uri = "https://mkdgr9nk5e.execute-api.us-east-1.amazonaws.com/cpu"+"?n=y"+stringParam;
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

  let uri = "https://5xyg1589i5.execute-api.us-east-1.amazonaws.com/memory"+"?n=y"+stringParam;
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

  let uri = "https://z1vqrxgdx5.execute-api.us-east-1.amazonaws.com/io"+"?n=y"+stringParam;
	let request = require('request');
	request(uri, function (error, response, body) {
    if (error){
       res.json(error);
    } else {
    	res.json(body);
    }
  });
};
