#! /usr/bin/env node
global.debug = false;
global.sumary = new Array();
global.filesList = new Array();
global.funcList = new Array();
global.sumary['files'] = 0;
global.sumary['funcs_elegibles'] = 0;
global.sumary['funcs_not_elegibles'] = 0;
global.fs = require('fs');
global.homedir = __dirname;  //require('os').homedir();
global.shelljs = require('shelljs');
global.credentials = {};
global.common = require('./lib/common');
global.method = 'apply';
global.common.treatParams();
global.provider = 'aws';
global.prepare 	= require('./lib/prepare');
global.conversor = require('./lib/conversor');
common.banner();
if (global.target){
	global.output = global.common.cleanDoubleSlashes('output/' + global.target.replace(/\.\.\//g,""))
	global.prepare.prepare(global.target,global.output).then(function(res_prepare){
		if (global.method == 'apply'){
			console.log("-----------------------------------------------------------------------");
			console.log(`Converted app will be avaiable in ${global.common.cleanDoubleSlashes(global.output+global.target)}`);
			console.log("-----------------------------------------------------------------------\n");
			console.log("Analyzing "+global.target+"...\n");
    	}
		global.common.downloadDependencies(global.target)
		conversor.convert(global.target, global.output);
		common.addDependencyToOutput(global.target, global.output , 'axios', '0.23.0');
		global.common.downloadDependencies(global.output)
		console.log("Finished!");
		common.sumary();
	},function(err){
		console.log("Error: fail on prepare process -> "+err);
	});
} else {
	console.log("Error: Target project not found! \
	            \nPlease provide the path of the original application \
				\nType node2faas --help for instructions");
}
