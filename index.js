#! /usr/bin/env node
global.debug = false;
global.sumary = new Array();
global.filesList = new Array();
global.funcList = new Array();
global.sumary['files'] = 0;
global.sumary['funcs_elegibles'] = 0;
global.sumary['funcs_not_elegibles'] = 0;
global.fs = require('fs');
global.homedir = require('os').homedir();
global.shelljs = require('shelljs');
global.credentials = {};
global.common = require('./lib/common');
global.method = 'apply';
global.common.treatParams();
global.provider = 'aws';
global.prepare = require('./lib/prepare');
let conversor = require('./lib/conversor');
common.banner();
if (global.target){
	global.prepare.prepare(global.target).then(function(res_prepare){
		if (global.method == 'apply'){
  		console.log("-----------------------------------------------------------------------");
  		console.log("Converted app will be avaiable in output/"+target);
  		console.log("Before execution run 'npm install request' inside output/"+target)
  		console.log("-----------------------------------------------------------------------\n");
  		console.log("Analyzing "+global.target)+"...\n";
    }
		const outputFolder = 'output/'
		global.common.downloadDependencies(global.target)
		conversor.convert(global.target, outputFolder+global.target);
		common.addDependencyToOutput(global.target, outputFolder+global.target, 'axios', '0.23.0');
		global.common.downloadDependencies(outputFolder+global.target)
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
