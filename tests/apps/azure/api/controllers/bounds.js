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

  let uri = "https://node2faas873.azurewebsites.net/api/cpu?code=Otqx3kuuajbvwWsxw5vnvaD1qLaMUfaH7goKxQN7syRU/n1CTUGXpw=="+stringParam;
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

  let uri = "https://node2faas473.azurewebsites.net/api/memory?code=unZgJZE2fddca3GvzXZy8XJUamn04XRerAIW1sFZwftr15pM6jBAYQ=="+stringParam;
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

  let uri = "https://node2faas837.azurewebsites.net/api/io?code=yEjLchymLfhsl7dL9pGKBbUAvXVlKpFIMTKIKejPK0vPd7sBBMKuJw=="+stringParam;
	let request = require('request');
	request(uri, function (error, response, body) {
    if (error){
       res.json(error);
    } else {
    	res.json(body);
    }
  });
};
