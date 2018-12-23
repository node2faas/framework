exports.convert = function(target){
	return new Promise((resolve, reject) => {
		/*console.log("Converting "+target);
		global.fs.readdirSync(target).forEach(file => {
	      	faasification(file, target);
		})*/
		var functionName = 'func_name79'
		var code = "exports."+functionName+" = async (event) => {\
				    var a = 20;\
				    var b = 10;\
				    var c = a + b;\
				    const response = {\
				        statusCode: 200,\
				        body: JSON.stringify(c),\
				    };\
				    return response;\
				};"
		createZipFile(functionName, code);
		publish(functionName,'tmp/'+functionName+'.zip').then(function(url){
			console.log(url);
		});
				

		//resolve();
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

function publish(functionName, codePath){
	return new Promise((resolve, reject) => {
		switch(global.provider) {
			case 'aws':
				var aws = require('./aws');
				aws.createLambda(functionName, codePath).then( function(url){
					console.log('Function creation finished!!!')
					resolve(url);
				});
				break;
			default:
		}
	});
}