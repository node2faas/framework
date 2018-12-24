exports.convert = function(target){
	return new Promise((resolve, reject) => {
		console.log("-----------------------------------------------------------------------");
		console.log("Converted app will be avaiable in output/"+target);
		console.log("Before execution run 'npm install request' inside output/"+target)
		console.log("-----------------------------------------------------------------------\n");
		console.log("Converting "+target)+"\n";
		global.fs.readdirSync(target).forEach(file => {
	      	faasification(file, target);
		})
	})
}

function createZipFile(functionName, code){
  	if (!fs.existsSync('tmp/')){
		fs.mkdirSync('tmp/')
	}
	var file = functionName+".js"
	var AdmZip = require('adm-zip')
	var zip = new AdmZip()
	var content = code;
	zip.addFile(file, Buffer.alloc(content.length, content), "Function "+functionName+" - automatic code with Node2FaaS");
	var willSendthis = zip.toBuffer();
	zip.writeZip("tmp/"+functionName+".zip");
}

function normalizeCode(functionName, code, parameters){
	switch(global.provider) {
	 	case "aws":
	 		parameters = parameters.replace('function','').replace(' ','');
	 		parameters = parameters.substring(parameters.indexOf('(')+1);
	 		parameters = parameters.substring(0,parameters.lastIndexOf(')')-1);
	 		parameters = parameters.replace(' ','');
	 		code = code.substring(code.indexOf('{')+1).substring(0, code.lastIndexOf('}')-1);
	 		var resPosition = code.lastIndexOf('res.json');
	 		var resultValue = false; 
	 		if (resPosition != -1){
	 			var resInit = code.indexOf('(', resPosition);
	 			var resEnd = code.indexOf(')', resInit);
	 			var resultCode = code.substring(resPosition, resEnd+1);
	 			code = code.replace(resultCode+';','').replace(resultCode+' ;','').replace(resultCode,'');
	 			resultValue = resultCode.replace('res.json(','').replace(')','');
	 		}
	 		var resultCode = (resultValue) ? 'body: JSON.stringify('+resultValue+')' : '';
	 		var newcode ='\
		  	exports.'+functionName+' = async (event) => {\n \
			   '+code+' \n \
			  const response = {\n \
			        statusCode: 200,\n \
			        '+resultCode+',\n \
			    };\n \
			    return response;\n \
			};\n \
		  	';
		  	return newcode;
			break
	default:
		console.log('3 - Sorry, this provider is not available!');
		process.exit(2);
	}
}

function faasification(file, folder){
	globalParams = require('./params');
	switch(file.split('.')[1]) {
	    case 'js':
	    	var content = fs.readFileSync(folder+file,'utf8')
	    	var require_position_begin = content.indexOf('require(');
	    	while (require_position_begin !== -1){
	    		var require_position_end  = content.indexOf(')',require_position_begin);
	    		var require_module = content.substring(require_position_begin+9,require_position_end-1).replace('./','').replace('.','../');
	    		var module_file = folder+require_module+'.js';
	    		if (global.fs.existsSync(module_file)){
	    			faasification(require_module.substring(require_module.lastIndexOf('/'))+'.js', module_file.substring(0,module_file.lastIndexOf('/')+1));	
	    		}
	    		require_position_begin = content.indexOf('require(',require_position_end);	
	    	}
	    	console.log('File (converted): '+'output/'+folder+file);
	    	fs.existsSync('output/'+folder+'/'+file) && fs.unlinkSync('output/'+folder+'/'+file, (err) => {if (err) {console.error(err)}});
	    	var stream = new Array();
	    	stream[file] = global.fs.createWriteStream('output/'+folder+'/'+file);
			stream[file].once('open', function(fd) {
			 	var export_position_begin = content.indexOf('exports');
			 	if (export_position_begin==-1){
			 		stream[file].write(content);
			 	}
		    	stream[file].write(content.substring(0, export_position_begin));
		    	while (export_position_begin !== -1){
		    		var export_position_init  = content.indexOf('{',export_position_begin);
			    	var export_position_end  = content.indexOf('}',export_position_init);
				    var skipString = '@node2faas-skip';
		    		if (content.substring(export_position_begin-(skipString.length+10),export_position_begin).indexOf(skipString) == -1){
			    		var export_code = content.substring(export_position_init,export_position_end+1);
			    		var count_key=(export_code.match(/{/g) || []).length - (export_code.match(/}/g) || []).length;
						var equal_position = content.indexOf('=', export_position_begin);
			    		var parameters = content.substring(equal_position+1, export_position_init)
			    		while (count_key!=0){
			    			export_position_end  = content.indexOf('}',export_position_end+1);
			    			export_code = content.substring(export_position_init,export_position_end+1);
			    			count_key=(export_code.match(/{/g) || []).length - (export_code.match(/}/g) || []).length; 	
				    	}
			    		var functionName = content.substring(export_position_begin, equal_position).replace('exports.', '').trim();
			    		if (globalParams.get('debug')){
				    		console.log('FunctionName:'+functionName);
				    		console.log('Params:'+parameters);
				    		console.log(export_code);
			    		}
			    		createZipFile(functionName, normalizeCode(functionName, export_code, parameters));
			     		publish(functionName,'tmp/'+functionName+'.zip').then(function(dataUrl){
						 	var newFuncCode = assemblyFunction(dataUrl.functionName, parameters, dataUrl.url);
						 	fs.readFile('output/'+folder+'/'+file, 'utf8', function (err,data) {
							  if (err) {
							    return console.log(err);
							  }
							  var result = data.replace('##!##'+dataUrl.functionName+'/##!##', newFuncCode);
							  fs.writeFile('output/'+folder+'/'+file, result, 'utf8', function (err) {
							     if (err) return console.log(err);
							  });
							});
						 });
						stream[file].write('##!##'+functionName+'/##!##');
					} else {
						stream[file].write(content.substring(export_position_begin, export_position_end+2));
					}
					export_position_begin = content.indexOf('exports',export_position_end);
					if (export_position_begin!=-1){
						stream[file].write(content.substring(export_position_end+2, export_position_begin));
					} else {
						stream[file].write(content.substring(export_position_end+2));	
					}
		    	}
			  	stream[file].end();
			})
	        break;
	    default:
	    	fs.copyFile(folder+file, 'output/'+folder+file, (err) => {
			  if (err) throw err;
			  console.log('File (untouched - just copied to output): '+folder+file);
			});
	} 
}

function assemblyFunction(name, parameters, url){
var result = '\
//Function converted by Node2FaaS\n\
exports.'+name+' = '+parameters+'{\n\
	var url =\''+url+'\';\n\
  	var request = require(\'request\');\n\
  	request(url, function (error, response, body) {\n\
    	res.json(JSON.parse(body).body); \n\
 	});\n \
}'
return result;
}

function publish(functionName, codePath){
	return new Promise((resolve, reject) => {
		if (!global.lockApi){
			switch(global.provider) {
				case 'aws':
					global.lockApi = true;
					var aws = require('./aws');
					aws.createLambda(functionName, codePath).then( function(data){
						console.log('Function '+functionName+' was created in: '+data.url)
						global.lockApi = false;
						resolve(data);
					});
					break;
				default:
			}
		} else {
			setTimeout(function(){
				publish(functionName, codePath).then(function(data){
					resolve(data);
				})
			}
			, 1000);
		}
	});
}