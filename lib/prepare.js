
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
	!global.fs.existsSync('output/'+target.replace('/','_')) && fs.mkdirSync('output/'+target.replace('/','_'));
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
	console.log(provider);
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
		  		    //rl_key.close();
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