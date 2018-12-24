
exports.prepare = function(target) {
	return new Promise((resolve, reject) => {
		createOutputStructure(target);
	    var provider = getProvider();
		if (!provider){
		   setProvider().then(function(){
		   		resolve();
		   });
		} else {
			global.provider = provider;
			console.log("Provider: "+provider);
			if (!checkCredentials(provider)){
		   		setCredentials(provider).then(function(){
		   			resolve();
		   		});
			} else {
				resolve();
			}
		}
	})
};

function createOutputStructure(target){
	!global.fs.existsSync('output/') && fs.mkdirSync('output/','0755', true);
	var rootPath = '';
	var targetArr = target.split('/');
	for (var i in targetArr){
		!global.fs.existsSync('output/'+rootPath+targetArr[i]) && fs.mkdirSync('output/'+rootPath+targetArr[i]);
		rootPath += targetArr[i]+'/';
	}
	createFolders(target, 'output/'+target);
}

function createFolders(source, target){
	const { lstatSync, readdirSync } = require('fs')
	const { join } = require('path')
	global.fs.readdirSync(source).forEach(file => {
		if (lstatSync(source+'/'+file).isDirectory()) {
			!global.fs.existsSync(target+'/'+file) && fs.mkdirSync(target+'/'+file);
			createFolders(source+'/'+file, target+'/'+file)
		}
	})
}

function getProvider() {
	if (global.fs.existsSync(global.homedir+'/.node2fass_provider')){
		var file = fs.readFileSync(global.homedir+'/.node2fass_provider');
		return file.toString();
	} else {
		return false;
	}
}

function setProvider() {
	return new Promise((resolve, reject) => {
		console.log('Please, select a provider: 1 - AWS | 2 - Google Cloud | 3 - Azure');
		const readline = require('readline');
		const rl_key = readline.createInterface({
		  input: process.stdin,
		  output: process.stdout
		});
		rl_key.question('Provider: ', (provider_id) => {
		   	switch(provider_id) {
			  case "1":
			    var stream = global.fs.createWriteStream(global.homedir+'/.node2fass_provider');
				stream.once('open', function(fd) {
					global.provider = 'aws';
				  	stream.write("aws");
				  	stream.end();
				  	if (!checkCredentials(provider)){
				  		setCredentials(provider).then(function(){
				   			resolve();
				   		});
					} else {
						resolve();
					}  	
				});
				break;
			default:
			    console.log('0 - Sorry, this provider is not available!');
			    process.exit(2);
			}
			rl_key.close();
		});
	});
}

function checkCredentials(provider) {
	switch(provider) {
	 	case "aws":
		  	if (global.fs.existsSync(global.homedir+'/.aws/credentials')){
				return true; 
			} else {
				return false;
			}
			break
	default:
		console.log('1 - Sorry, this provider is not available!');
		process.exit(2);
	}
}

function setCredentials(provider) {
	return new Promise((resolve, reject) => {
		provider = provider.trim();
		switch(provider) {
		 	case "aws":
		 		console.log('Please, provide your AWS credencials');
				const readline = require('readline');
				const rl_key = readline.createInterface({
				  input: process.stdin,
				  output: process.stdout
				});
				rl_key.question('Access key: ', (aws_access_key_id) => {
				  rl_key.question('Key password: ', (aws_access_key_pass) => {
		  		    fs.mkdirSync(global.homedir+'/.aws');
					var stream = global.fs.createWriteStream(global.homedir+'/.aws/credentials');
					stream.once('open', function(fd) {
					  stream.write("[default]");
					  stream.write("\naws_access_key_id = "+aws_access_key_id);
					  stream.write("\naws_secret_access_key = "+aws_access_key_pass);
					  stream.write("\nregion = us-east-1");
					  stream.end();
					  resolve();
					  rl_key.close();		
					});
		  		  });
				});
				break	
		default:
			console.log('2 - Sorry, this provider is not available!');
			process.exit(2);
		}
	});
}