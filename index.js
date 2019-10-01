#! /usr/bin/env node
global.debug = true;
global.fs = require('fs');
global.homedir = require('os').homedir();
global.shelljs = require('shelljs');
global.credentials = {};
global.common = require('./lib/common');
var prepare = require('./lib/prepare');
var conversor = require('./lib/conversor');
var target = process.argv[2];
common.banner();
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
