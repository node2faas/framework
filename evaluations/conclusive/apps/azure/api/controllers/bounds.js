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

  let uri = "https://node2faas174.azurewebsites.net/api/cpu?code=5JIrUbFkPtn3ZdZYGuPk22smyvfc8WjWthr3GTHUP3U1gPepZFPcaA=="+stringParam;
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

  let uri = "https://node2faas112.azurewebsites.net/api/memory?code=p3j7ZiHlm32kq67qP9zHjEaJ9zCI/UQqiOchoOT4tWpzazmDw/a3XQ=="+stringParam;
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

  let uri = "https://node2faas696.azurewebsites.net/api/io?code=jHORePah/UbKgk3wat3yRoD3h5BSak3iJNYZvcoAacq7jQlqRuvHww=="+stringParam;
	let request = require('request');
	request(uri, function (error, response, body) {
    if (error){
       res.json(error);
    } else {
    	res.json(body);
    }
  });
};
