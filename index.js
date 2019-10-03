#! /usr/bin/env node
global.debug = false;
global.fs = require('fs');
global.homedir = require('os').homedir();
global.shelljs = require('shelljs');
global.credentials = {};
global.common = require('./lib/common');
global.method = 'apply';
global.common.treatParams();
global.prepare = require('./lib/prepare');
let conversor = require('./lib/conversor');
common.banner();
if (global.target){
	global.prepare.prepare(global.target).then(function(res_prepare){
		conversor.convert(global.target).then(function(res_conversor){
			console.log("Finished!");
		});
	},function(){
		console.log("Error: fail on prepare process");
	});
} else {
	console.log("Error: Target project not found, please provide the path of the original application");
}
