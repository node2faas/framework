/*******************************************************
 * A process to ensure requirements before framework
 * process starts.
 *
 * @since      0.0.1
 * @memberof   node2faas
 *
 *******************************************************/

 /**
  * Controls the preparation process
  *
  * Creates the output structure and ensure there is
	* a provider setted (including its credentials)
  *
  * @since          0.0.1
  * @memberof       node2faas
  * @param {string}   target Path of the application to be converted.
  * @return {Promisse} (resolve,reject) The result of preparation process.
  */
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
			      var text_provider = "aws"
				  break;
					case "2":
			      var text_provider = "gcp"
				  break;
					case "3":
			      var text_provider = "azure"
				  break;
			    default:
			      console.log('0 - Sorry, this provider is not available!');
			      process.exit(2);
			  }
				var stream = global.fs.createWriteStream(global.homedir+'/.node2fass_provider');
			stream.once('open', function(fd) {
				global.provider = text_provider;
					stream.write(text_provider);
					stream.end();
					if (!checkCredentials(provider)){
						setCredentials(provider).then(function(){
							resolve();
						});
					} else {
						resolve();
					}
				});
			  rl_key.close();
		});
	});
}

function checkCredentials(provider) {
	if (global.fs.existsSync(global.homedir+'/.'+provider+'/credentials')){
	  return true;
	} else {
		return false;
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
			case "gcp":
			  console.log('GCP not yet enabled');
		 	  process.exit(2);
			break
			case "azure":
			  console.log('Azure not yet enabled');
		 	  process.exit(2);
			break
		default:
			console.log('2 - Sorry, this provider is not available!');
			process.exit(2);
		}
	});
}
