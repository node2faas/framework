#! /usr/bin/env node
global.fs = require('fs');
global.homedir = require('os').homedir();
var target = process.argv[2];
if (target){
	banner();
	if (!global.fs.existsSync(global.homedir+'/.aws/credentials')){
		console.log('Please, provide your AWS credencials');
		const readline = require('readline');
		const rl_key = readline.createInterface({
		  input: process.stdin,
		  output: process.stdout
		});
		rl_key.question('Access key: ', (aws_access_key_id) => {
		  rl_key.question('Key password: ', (aws_access_key_pass) => {
  		    rl_key.close();
  		  	createCredentialFile(aws_access_key_id, aws_access_key_pass);
		  });		
		  
		});
	} else {
		createLambda();
		//convert(target);
	}
} else {
	console.log("Error: Target project not found");
}

function createLambda(){
	var AWS = require('aws-sdk');
	AWS.config.update({region:'us-east-1'});
	var lambda = new AWS.Lambda();
	/*lambda.addPermission(params, function (err, data) {
  		if (err) 
  			console.log(err, err.stack); // an error occurred
  		else     
  			console.log(data);           // successful response
	});
*/
    var codigo = "exports.subtrai = function(req, res) {var result = req.params.a - req.params.b;res.json(result); };".toString('base64');
	var params = {
	  //Code: "exports.subtrai = function(req, res) {var result = req.params.a - req.params.b;res.json(result); };", 
	  Code: { /* required */
	    //S3Bucket: 'STRING_VALUE',
	    //S3Key: 'STRING_VALUE',
	    //S3ObjectVersion: 'STRING_VALUE',
	    ZipFile: fs.readFileSync('code.zip')
	  },
	  Description: "", 
	  FunctionName: "Subtrai", 
	  Handler: "code.subtrai", // is of the form of the name of your source file and then name of your function handler
	  MemorySize: 128, 
	  Publish: true, 
	  Role: "arn:aws:iam::270561134573:role/lambada", // replace with the actual arn of the execution role you created
	  Runtime: "nodejs4.3", 
	  Timeout: 15, 
	  VpcConfig: {
	  }
	 };
	 lambda.createFunction(params, function(err, data) {
	   if (err) 
	   		console.log(err, err.stack); // an error occurred
	   else     
	   		console.log(data);           // successful response
	   /*
	   data = {
	    CodeSha256: "", 
	    CodeSize: 123, 
	    Description: "", 
	    FunctionArn: "arn:aws:lambda:us-west-2:123456789012:function:MyFunction", 
	    FunctionName: "MyFunction", 
	    Handler: "source_file.handler_name", 
	    LastModified: "2016-11-21T19:49:20.006+0000", 
	    MemorySize: 128, 
	    Role: "arn:aws:iam::123456789012:role/service-role/role-name", 
	    Runtime: "nodejs4.3", 
	    Timeout: 123, 
	    Version: "1", 
	    VpcConfig: {
	    }
	   }
	   */
	 });
}

function banner(){
console.log("Welcome to");
console.log(" _   _           _      ____  _____           ____  ");
console.log("| \\ | | ___   __| | ___|___ \\|  ___|_ _  __ _/ ___| ");
console.log("|  \\| |/ _ \\ / _` |/ _ \\ __) | |_ / _` |/ _` \\___ \\ ");
console.log("| |\\  | (_) | (_| |  __// __/|  _| (_| | (_| |___) |");
console.log("|_| \\_|\\___/ \\__,_|\\___|_____|_|  \\__,_|\\__,_|____/ ");
console.log("");
}

function createCredentialFile(key, pass){
	fs.mkdirSync(global.homedir+'/.aws');
	var stream = global.fs.createWriteStream(global.homedir+'/.aws/credentials');
	stream.once('open', function(fd) {
	  stream.write("[default]");
	  stream.write("\naws_access_key_id = "+key);
	  stream.write("\naws_secret_access_key = "+pass);
	  stream.end();
	});
}

function convert(target){
	console.log("Converting "+target);
	createOutputStructure(target);
	global.fs.readdirSync(target).forEach(file => {
      	faasification(file, target);
	})
}

function createOutputStructure(target){
	!global.fs.existsSync('output/') && fs.mkdirSync('output/','0755', true);
	!global.fs.existsSync('output/'+target.replace('/','_')) && fs.mkdirSync('output/'+target.replace('/','_'));
}

function faasification(file, folder){
	switch(file.split('.')[1]) {
	    case 'js':
	    	var content = fs.readFileSync(folder+file,'utf8')
	    	var require_position_begin = content.indexOf('require(');
	    	while (require_position_begin !== -1){
	    		var require_position_end  = content.indexOf(')',require_position_begin);
	    		var require_module = content.substring(require_position_begin+9,require_position_end-1).replace('./','').replace('.','../');
	    		var module_file = folder+require_module+'.js';
	    		console.log('module_file '+module_file);
	    		if (global.fs.existsSync(module_file)){
	    			console.log('--->found');
	    			faasification(require_module.substring(require_module.lastIndexOf('/'))+'.js', module_file.substring(0,module_file.lastIndexOf('/')+1));	
	    		} else{
	    			console.log('--->not found');
	    		}
	    		require_position_begin = content.indexOf('require(',require_position_end);	
	    	}
	    	var export_position_begin = content.indexOf('exports');
	    	while (export_position_begin !== -1){
	    		var export_position_init  = content.indexOf('{',export_position_begin);
		    	var export_position_end  = content.indexOf('}',export_position_init);
		    	var export_code = content.substring(export_position_init,export_position_end+1);
	    		var count_key=(export_code.match(/{/g) || []).length - (export_code.match(/}/g) || []).length;
				while (count_key!=0){
	    			export_position_end  = content.indexOf('}',export_position_end+1);
	    			export_code = content.substring(export_position_init,export_position_end+1);
	    			count_key=(export_code.match(/{/g) || []).length - (export_code.match(/}/g) || []).length; 	
		    	}
	    		console.log(export_code);
	    		export_position_begin = content.indexOf('exports',export_position_end);
	    	}
	    	/*var stream = global.fs.createWriteStream('output/'+target.replace('/','_')+file);
			stream.once('open', function(fd) {
			  stream.write(content);
			  stream.end();
			});*/
	        break;
	    default:
	} 
}