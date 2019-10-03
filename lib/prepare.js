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
			console.log("  Provider: "+provider);
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

/**
 * Creates the output application structure
 *
 * @since          0.0.1
 * @memberof       node2faas
 * @param {string}   target Path of the application to be converted.
 */
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

/**
 * Creates folders structures just like original app
 *
 * Iterates over original app folders and creates the
 * same structure on output folder
 *
 * @since          0.0.1
 * @memberof       node2faas
 *
 * @param {string}   source Path of the application to be converted.
 * @param {string}   target Path of the output.
 */
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

/**
 * Get a provider defined on local file
 *
 * Try to get provider on file, otherwise returns false
 *
 * @since          0.0.1
 * @memberof       node2faas
 *
 * @return {string|boolean} Provider's name or false.
 */
function getProvider() {
	if (global.fs.existsSync(global.homedir+'/.node2fass_provider')){
		var file = fs.readFileSync(global.homedir+'/.node2fass_provider');
		return file.toString();
	} else {
		return false;
	}
}

/**
 * Process to obtain the provider from user
 *
 * Ask user to choose a provider to be used to publish
 * functions
 *
 * @since          0.0.1
 * @memberof       node2faas
 *
 * @return {Promisse} Provider selected and its credential putted on file.
 */
function setProvider() {
	return new Promise((resolve, reject) => {
		console.log('  Please, select a provider:');
		console.log('    1 - Amazon AWS');
		console.log('    2 - Google Cloud Platform (GCP)');
		console.log('    3 - Microsoft Azure');
		const readline = require('readline');
		const rl_key = readline.createInterface({
		  input: process.stdin,
		  output: process.stdout
		});
		rl_key.question('  Provider: ', (provider_id) => {
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
			      console.log('Error: Sorry, this provider is not available!');
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

/**
 * Check if a file with provider's credentials is present
 *
 * Ask user to choose a provider to be used to publish
 * functions
 *
 * @since          0.0.1
 * @memberof       node2faas
 *
 * @param {string} provider The name of the provider.
 * @return {boolean} File exists?.
 */
function checkCredentials(provider) {
	if (global.fs.existsSync(global.homedir+'/.'+provider+'/credentials')){
	  return true;
	} else {
		return false;
	}
}

/**
 * Process to obtain the provider's credentials from user
 *
 * Ask user to fill the params for it's access credentials
 *
 * @since          0.0.1
 * @memberof       node2faas
 *
 * @return {Promisse} Provider's credentials properly seted down on file.
 */
function setCredentials(provider) {
	return new Promise((resolve, reject) => {
		provider = provider.trim();
		switch(provider) {
		 	case "aws":
			  console.log('  Fill your AWS credencials');
				const readline_aws = require('readline');
				const rl_key_aws = readline_aws.createInterface({
				  input: process.stdin,
				  output: process.stdout
				});
				rl_key_aws.question('    Access key: ', (aws_access_key_id) => {
					rl_key_aws.question('    Key password: ', (aws_access_key_pass) => {
						rl_key_aws.question('    Region (default: us-east-1): ', (region) => {
              region = (region) ? region : 'us-east-1';
							let credentials = '[default] \
							                             \naws_access_key_id = '+aws_access_key_id+
							                            '\naws_access_key_pass = '+aws_access_key_pass+
																					'\nregion = '+region+
																					'\n';
							if (!global.fs.existsSync(global.homedir+'/.'+provider)) {
							  global.fs.mkdirSync(global.homedir+'/.'+provider);
						  }
							global.fs.writeFileSync(global.homedir+'/.'+provider+'/credentials', credentials, { mode: 0o600 });
							resolve();
					  });
					});
				});
		  break
			case "gcp":
				console.log('  Fill your Google Cloud Platform (GCP) credencials');
				const readline_gcp = require('readline');
				const rl_key_gcp = readline_gcp.createInterface({
					input: process.stdin,
					output: process.stdout
				});
				rl_key_gcp.question('    JSON file location: ', (json_file) => {
					rl_key_gcp.question('    Region (default: us-central1): ', (region) => {
						try {
							if (global.fs.existsSync(json_file)) {
								global.common.debug('File '+json_file+' found');
							} else {
								console.log('  Error: File '+json_file+' not found, process aborted');
								process.exit(2);
							}
						} catch(err){
							console.log('  Error: Failed on finding file '+json_file+' '+err);
						}
						region = (region) ? region : 'us-central1';
						let credentials = '[default] \
																				 \njson_file = '+json_file+
																				'\nregion = '+region+
																				'\n';
						if (!global.fs.existsSync(global.homedir+'/.'+provider)) {
						  global.fs.mkdirSync(global.homedir+'/.'+provider);
					  }
						global.fs.writeFileSync(global.homedir+'/.'+provider+'/credentials', credentials, { mode: 0o600 });
						resolve();
					});
				});
			break
			case "azure":
				console.log('  Fill your Azure credencials');
				const readline_azure = require('readline');
				const rl_key_azure = readline_azure.createInterface({
					input: process.stdin,
					output: process.stdout
				});
				rl_key_azure.question('    Subscription_id: ', (subscription_id) => {
					rl_key_azure.question('    Tenant_id: ', (tenant_id) => {
						rl_key_azure.question('    Client_id: ', (client_id) => {
							rl_key_azure.question('    Client_secret: ', (client_secret) => {
								rl_key_azure.question('    Region (default: Central US): ', (region) => {
									region = (region) ? region : 'centralus';
									let credentials = '[default] \
																							 \nsubscription_id = '+subscription_id+
																							'\ntenant_id = '+tenant_id+
																							'\nclient_id = '+client_id+
																							'\nclient_secret = '+client_secret+
																							'\nregion = '+region+
																							'\n';
									if (!global.fs.existsSync(global.homedir+'/.'+provider)) {
										global.fs.mkdirSync(global.homedir+'/.'+provider);
									}
									global.fs.writeFileSync(global.homedir+'/.'+provider+'/credentials', credentials, { mode: 0o600 });
									resolve();
									});
								});
							});
						});
				});
			break
		default:
			console.log('  Error: Sorry, this provider is not available!');
			process.exit(2);
		}
	});
}
