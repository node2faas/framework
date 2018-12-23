#! /usr/bin/env node
global.fs = require('fs');
global.homedir = require('os').homedir();
console.log(global.homedir);
var funcs = require('./lib/functions');
var prepare = require('./lib/prepare');
var conversor = require('./lib/conversor');
var target = process.argv[2];
funcs.banner();
if (target){
	prepare.prepare(target).then(function(res_prepare){
		conversor.convert(target).then(function(res_conversor){
			console.log("Finished!");
		});
	},function(){
		console.log("Error: fail on prepare process");
	});
} else {
	console.log("Error: Target project not found, please provide the path of the original application");
}