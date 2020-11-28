/***********************************************
 * Process to convert application's functions
 * to work with Function as a Service providers
 *
 * @since      0.0.1
 * @memberof   node2faas
 *
 **********************************************/

/**
 * Controls the convertion process
 *
 * Read the content of the target and iterates over each
 * file executing the convertion process
 *
 * @since          0.0.1
 * @memberof       node2faas
 * @param {string}   target Path of the application to be converted.
 * @return {Promisse} (resolve,reject) The result of convertion process.
 */
exports.convert = function(target){
    var files = global.fs.readdirSync(target);
    global.fs.readdirSync(target).forEach(file => {
      global.sumary['files']++;
      global.filesList.push(target+file);
      if (fs.lstatSync(target+'/'+file).isDirectory()){
        this.convert(target+'/'+file);
      } else {
        conversion('/'+file,target);
      }
		})
}

/**
 * Execute the convertion of a file
 *
 * For .js files: try to do de conversion
 * For other types of file: just copy to output destination
 *
 * @since            0.0.1
 * @memberof         node2faas
 * @param {string}   file File to be analyzed.
 * @param {string}   folder The folder where file is in.
 */
function conversion(file, folder){
	switch(file.split('.')[1]) {
	    case 'js':
        if (!fs.existsSync('output/'+folder+file)){
  				try {
            fs.copyFileSync(folder+file, 'output/'+folder+file);
            global.common.debug('File '+folder+file+' was copied to output/'+folder+file);
          } catch(err) {
            global.common.debug(err);
          }
        }
        loadRequires(file, folder);
				let functions = extractFunctions(folder+file);
        functions.forEach(function(func,index,array){
          if (global.method=='apply') {
  					global.common.debug('Creating zipfile for function '+func.name);
  					let zipfile = createZipFile(func.name, normalizeCode(func.name, func.algoritm, func.parameters));
  					global.common.debug('File '+zipfile+' was created');
  					let func_publicated = publication(func.name,zipfile);
  					global.common.debug('Function '+func.name+' was publicated');
  					let new_code = assemblyFunction(func.name, func.parameters, func_publicated.url);
  					global.common.debug('The new code for function '+func.name+' is => \n\n'+new_code);
            replaceHashToNewFunctionCode('output/'+folder+file,func.name,new_code)
  					global.common.debug('File '+folder+file+' was updated with new code for function '+func.name);
          } else {
            let func_publicated = publication(func.name,null);
  					global.common.debug('Function '+func.name+' was despublicated');
          }
				});
	    break;
      default:
        if (global.method == 'apply'){
          if (!fs.lstatSync(folder+file).isDirectory()){
            try {
              fs.copyFileSync(folder+file, 'output/'+folder+file);
              global.common.debug('File (untouched - just copied to output): '+folder+file);
          	} catch(err) {
          	  global.common.debug(err);
          	}
          }
        }
	}
}

/**
 * Create a zip file
 *
 * Creates a compressed zip file from a content inside
 * a tmp folder created in the users context
 *
 * @since            0.0.1
 * @memberof         node2faas
 * @param {string}   functionName Name of the function.
 * @param {string}   content Content to be zipped.
 * @return {string}  Created file name.
 */
function createZipFile(functionName, content){
  if (!fs.existsSync('tmp/')){
		fs.mkdirSync('tmp/')
	}
  let AdmZip = require('adm-zip');
	let zip = new AdmZip();
  switch(global.provider) {
	 	case "aws":
      filename = functionName+'.js';
      zip.addFile(filename, Buffer.alloc(content.length, content), "Function "+functionName+" - automatic code with Node2FaaS");
    	break;
    case "gcp":
      filename = 'index.js';
      zip.addFile(filename, Buffer.alloc(content.length, content), "Function "+functionName+" - automatic code with Node2FaaS");
    	break;
    case "azure":
      filename = 'index.js';
      let func_json = {
        "bindings": [
          {
            "authLevel": "function",
            "type": "httpTrigger",
            "direction": "in",
            "name": "req",
            "methods": [
              "get",
              "post"
            ]
          },
          {
            "type": "http",
            "direction": "out",
            "name": "res"
          }
        ]
       };
      let host_json = {
        "version": "2.0"
      }
      zip.addFile('host.json', Buffer.alloc(JSON.stringify(host_json).length, JSON.stringify(host_json)), "Function "+functionName+" - automatic code with Node2FaaS");
      zip.addFile(functionName+'/function.json', Buffer.alloc(JSON.stringify(func_json).length, JSON.stringify(func_json)), "Function "+functionName+" - automatic code with Node2FaaS");
      zip.addFile(functionName+'/'+filename, Buffer.alloc(content.length, content), "Function "+functionName+" - automatic code with Node2FaaS");
    	break;
    default:
  		console.log('Error: Sorry, this provider is not available! (compressing)');
  		process.exit(2);
  }
  let zipfile = "tmp/"+filename+".zip";
	let willSendthis = zip.toBuffer();
	zip.writeZip(zipfile);
	return zipfile;
}

/**
 * Normalize the function code
 *
 * Transform the original code in order to work properly
 * on each provider
 *
 * @since            0.0.1
 * @memberof         node2faas
 *
 * @param global {string} provider Name of the provider.
 *
 * @param {string}   functionName Name of the function.
 * @param {string}   code The original code of the function.
 * @param {string[]} parameters A list of parameters.
 * @return {string}  The new function's code for choose provider.
 * @todo Make treatment on the parameters
 */
function normalizeCode(functionName, code, parameters){
  //Disable 'res' variables
  code = code.replace('res.','//res.','g');
  //Disable 'return' statement
  code = code.replace('return ','//return');
  switch(global.provider) {
    case "gcp":
      code = code.replace(/params/g,'query');
      newcode = '\
            \nexports.'+functionName+' = ('+parameters.join(',')+') => { \
            \n var result = \'\' \
            \n'+code+' \
            \n  res.status(200).send(JSON.stringify(result)); \
            \n};';
      break;
    case "aws":
      //Replace parameters usage to aws version
      var splitTerm = 'event.queryStringParameters';
      for (var i in parameters){
        var regex = new RegExp(parameters[i]+'[.].*?[.]','g');
        code = code.replace(regex,splitTerm+'.');
      }
      while (code.search(splitTerm+'[.]') != -1){
        var arrCode = code.split(splitTerm+'.');
        var left = arrCode.shift();
        var right = arrCode.join(splitTerm+'.');
        var nonWordPosition = right.search(/\W/);
        middle = right.substring(0,nonWordPosition);
        right = right.substring(nonWordPosition);
        code = left+splitTerm+'[\''+middle+'\']'+right;
      }
      code = code.replace(/params/g,'queryStringParameters');
      var newcode = '\
          \nexports.'+functionName+' = ('+parameters.join(',')+',callback) => { \
          \n'+code+' \
          \n  const done = (err, res) => callback(null, { \
          \n    statusCode: err ? \'400\' : \'200\', \
          \n    body: err ? err.message : JSON.stringify(res), \
          \n    headers: {\'Content-Type\': \'application/json\', \
          \n    }, \
          \n  }); \
          \n  done(null,result); \
          \n};';
      break;
    case 'azure':
      code = code.replace(/params/g,'query');
      code = code.replace(new RegExp("/tmp/", 'g'), "D:\\\\home\\\\data\\\\temp");
      var newcode = '\
          \nmodule.exports = async function (context,'+parameters.join(',')+') { \
          \n  context.log("JavaScript HTTP trigger function processed a request for '+functionName+'."); \
          \n  '+code+' \
          \n  if (req.query.name || (req.body && req.body.name)) { \
          \n    context.res = { \
          \n      // status: 200, /* Defaults to 200 */ \
          \n      body: "Parameter Name is" + (req.query.name || req.body.name) \
          \n    }; \
          \n  } else { \
          \n    context.res = { \
          \n      status: 400, \
          \n      body: result \
          \n   }; \
          \n  } \
          \n};';
      break;
    default:
	 		console.log('Provider not available');
      process.exit(1);
  }
  common.debug('New function code generated for '+global.provider+': \n'+newcode);
  return newcode;
}

/**
 * Splits a function code to a hash
 *
 * Transform the original code in a hash with:
 *   - name: The name of the function
 *   - parameters: An array of the parameters as string
 *   - algoritm: The commands inside the function
 *   Ex: {'name':'...','parameters':'...','algoritm':'...'}
 *
 * @since            0.0.2
 * @memberof         node2faas
 *
 * @param {string}   code The original code of the function.
 * @return {hash}  The hash of the function
 */
function splitFunction(code){

  let name = code.split('=')[0].trim();
	let parameters = new Array();
	let temp = code.split('=')[1];
  if (temp){
    temp = temp.split('{')[0]
	                     .replace('(','').replace(')','')
											 .replace('function','').replace(' ','').trim().split(',').forEach(function(element,index,array){
												 parameters.push(element.trim());
											 });
  }
	let algoritm = code.split('{');
  algoritm.shift();
  algoritm = algoritm.join('{');
	return {'name':name,'parameters':parameters,'algoritm':algoritm};
}

/**
 * Replaces the original code to a hash inside the output file
 *
 * Finds the definition of a function inside its output file (previously copied)
 * and change it for a hash containing the identification of the function
 * Ex: ##!##functionName/##!##
 *
 * The output file is updated!
 *
 * @since            0.0.2
 * @memberof         node2faas
 * @param {string}   file Full path of the file.
 * @param {string}   functionName The name of the function.
 * @param {string}   match Term used to separate functions.
 * @return {string}  New file content.
 */
function replaceFunctionCodeToHash(file,functionName,match='exports.'){
	let content = global.shelljs.cat(file);
  let content_arr = content.split(match+functionName);
	let left_side = content_arr.shift();
	content_arr = (content_arr.length) ? content_arr.join().split(match) : [];
	let middle = (content_arr.length) ? content_arr.shift() : '';
	let right_side = content_arr.join(match);
	let extra = (middle) ? middle.split('').reverse().join('').split('}')[0].split('').reverse().join('').trim() : '';
	let pattern = '\n##!##'+functionName+'/##!##'
  extra = (extra && extra.split('')[0]!=';') ? ';'+extra : extra;
  let newcode = left_side+pattern+extra;
	newcode += (right_side) ? '\n'+match+right_side : '';
	try {
	  global.fs.writeFileSync(file, newcode, { mode: 0o755 });
		global.common.debug('File '+file+' updated');
	} catch(err) {
	  console.error('Error: while updaling file '+file+' => '+err);
	}
	global.common.debug('Replaced code for function '+functionName+' in file '+file+' is ⬇ \n\n'+newcode);
	return newcode;
}

/**
 * Replaces a function hash inside output file to a new definition
 *
 * Finds a hash like "##!##functionName/##!##" inside output file
 * and changes for the new function code
 *
 * The output file is updated!
 *
 * @since            0.0.2
 * @memberof         node2faas
 * @param {string}   file Full path of the file.
 * @param {string}   functionName The name of the function.
 * @return {string}  New file content.
 */
function replaceHashToNewFunctionCode(file,functionName,new_code){
	let content = global.shelljs.cat(file);
	let pattern = '\n##!##'+functionName+'/##!##'
  content = content.replace(pattern,new_code);
	global.fs.writeFileSync(file, content, { mode: 0o755 });
	return content;
}

/**
 * Extracts functions definitions on a file
 *
 * Reads a file and searches for function definitions. Returns a list
 * of functions as hashes with name,parameters and algoritm
 *
 * @since            0.0.2
 * @memberof         node2faas
 * @param {string}   file Full path of the file.
 * @return {hash[]}  List of functions hashes.
 */
function extractFunctions(file){
	let analyzer = require('./analyzer')
	global.common.debug('Extracting functions from file '+file);
	let functions = new Array();
	let qtd_exports = global.shelljs.exec("cat "+file+"    | \
	                                      grep ^exports.   | \
																				wc -l            | \
																				sed -e 's/ //g'  ",
																				{silent:true})
																				.stdout;
  let file_content = global.shelljs.exec("cat "+file,{silent:true}).stdout;
  file_content = file_content.replace(new RegExp(/\nexports[.]/, 'g'),'\nfaasificable.');
	let cont = 2;
	while (cont-1 <= qtd_exports){
	let code = global.shelljs.exec("echo '"+file_content+"'                    | \
	                                 tr '\n' 'ß'                               | \
																	 awk -F'faasificable.' '{print $"+cont+"}' | \
																	 awk -F'faasificable.' '{print $1}'        | \
                                   tr 'ß' '\n'                               ",
																	 {silent:true})
																	 .stdout;
   code = code.split('').reverse().join('').split('}');
   code.shift();
   code = code.join('}').split('').reverse().join('');
   let func = splitFunction(code);
   if (func.name && !global.funcList[func.name]){
	   if (analyzer.analyzeFunction(func)){
       console.log('Function '+func.name+' is elegible to be published on FaaS');
	     functions.push(func);
       global.sumary['funcs_elegibles']++;
     } else {
       global.common.debug('Function '+func.name+' isn\'t elegible to be published on FaaS');
       global.sumary['funcs_not_elegibles']++;
     }
     global.funcList[func.name]=func;
   }
	 cont++;
	}
	if (functions.length){
	  global.common.debug('Functions found in file '+file+' ⬇ \n'+JSON.stringify(functions));
    functions.forEach(function(element,index,array){
			replaceFunctionCodeToHash('output/'+file,element.name);
	  });
	} else {
	 global.common.debug('File '+file+' there`s no functions');
	}
	return functions;
}

/**
 * Extracts requires definitions on a file
 *
 * Reads a file and searches for requires definitions. Returns a list
 * of requires as string
 *
 * @since            0.0.2
 * @memberof         node2faas
 * @param {string}   file Name of the file.
 * @param {string}   file Folder where file is in.
 * @return {string[]}  List of requires.
 */
function extractRequires(file, folder){
	 global.common.debug('Extracting requires from file '+file);
	 let path_init = file.split('/')[0];
	 file = folder+file;
   let requires = new Array();
	 let qtd_requires = global.shelljs.exec("cat "+file+"   | \
	                                         grep 'require' | \
																					 wc -l          | \
																					 sed -e 's/ //g'",
																					 {silent:true})
																					 .stdout
																					 .replace('\n','');
	 global.common.debug('Was found '+qtd_requires+' requires on file '+file);
	 let cont = 2;
	 while (cont-1 <= qtd_requires){
		 let code = global.shelljs.exec("cat "+file+"                        | \
		                                 tr '\n' 'ß'                         | \
																		 awk -F'require' '{print $"+cont+"}' | \
																		 awk -F')' '{print $1}'              | \
																		 sed -e 's/(//g'                     | \
																		 sed -e \"s/'//g\" | sed -e 's/ß//g' ",
																		 {silent:true})
																		 .stdout
																		 .replace('./','')
																		 .replace(/^[.]/,path_init+'/')
																		 .replace('\n','.js');
		 requires.push(code);
		 cont++;
	 }
	 return requires;
}

/**
 * Load required files on the framework process
 *
 * Take all required files inside a file and apply the
 * conversion process
 *
 * @since            0.0.2
 * @memberof         node2faas
 *
 * @param {string}   file Name of the file.
 * @param {string}   file Folder where file is in.
 */
function loadRequires(file,folder){
	let full_file = folder+file;
	global.common.debug('Loading requires in file '+full_file);
	let requires = extractRequires(file,folder);
	if (requires.length){
		global.common.debug('Requires found in file '+full_file+' ⬇ \n '+JSON.stringify(requires));
		requires.forEach(function(req_file, index, array) {
	    try {
				search_file = folder+req_file;
				if (global.fs.existsSync(search_file)) {
					global.common.debug('File '+search_file+' found');
					conversion(req_file,folder);
				} else {
					global.common.debug('File '+search_file+' not found');
				}
			} catch(err){
				global.common.debug('Failed on finding file '+search_file+' '+err);
			}
		});
  } else {
		global.common.debug('No requires found in file '+full_file);
	}
}

/**
 * Assemblies a new function content
 *
 * Generates a new function definition using a HTTP request call
 * to process it on a FaaS provider
 *
 * @since            0.0.1
 * @memberof         node2faas
 *
 * @param {string}   functionName The name of the function.
 * @param {string[]} parameters Parameters definition.
 * @param {string}   uri URI to FaaS function published.
 * @return {string} The new local code for a converted function.
 * @todo Review the parameters treatment
 */
function assemblyFunction(functionName, parameters, uri){
  let preStr = "+\"?n=y\"";
  switch(global.provider) {
    case "aws":
      var returnString = "res.json(body);"
      break;
    case "gcp":
      var returnString = "res.json(body);"
      break;
    case "azure":
      preStr="";
      var returnString = "res.json(body);"
      break;
    default:
      var returnString = "res.json(JSON.parse(body).body);"
  }
  let buildStringParameters = '';
  for (var i in parameters){
    buildStringParameters += 'if( '+parameters[i]+'.params !== undefined ){ \
                            \n  for (var i in '+parameters[i]+'.params){ \
                            \n    stringParam += "&"+i+"="+'+parameters[i]+'.params[i]; \
                            \n  } \
                            \n}\n';
  }
  let result = '\
    \nexports.'+functionName+' = function('+parameters+'){ \
    \n  /**** Function converted by Node2FaaS ****/ \
    \n  let stringParam = \'\'; \
    \n  '+buildStringParameters+' \
	  \n  let uri = "'+uri.trim()+'"'+preStr+'+stringParam; \
    \n	let request = require(\'request\'); \
    \n	request(uri, function (error, response, body) { \
    \n    if (error){ \
    \n       res.json(error); \
    \n    } else { \
    \n    	'+returnString+' \
 	  \n    } \
    \n  }); \
    \n}';
  return result;
}


/**
 * Publishes a function on the FaaS provider setted globally
 *
 * Acording to the provider setted globally it will use a specific
 * terraform blueprint designed to ensure all function requirements
 * on the cloud. It is made by shell commands and requires a local
 * terraform installation.
 *
 * @see https://www.terraform.io/
 *
 * @since            0.0.2
 * @memberof         node2faas
 *
 * @param global {string} provider Name of the provider.
 *
 * @param {string}   functionName The name of the function.
 * @param {string} codePath The path to file where code is in (a zipfile).
 * @return {hash} A hash with: functionName and url(uri).
 */
function publication(functionName, codePath){
		let result;
    let method = (global.method=='apply') ? "Publishing" : "Destroying";
    let region = global.prepare.getRegion();
    let funcFolder = global.homedir+'/node_modules/node2faas/terraform/.exec-'+global.provider+'-'+functionName;
    let funcPublicated = false;
    if (!fs.existsSync(funcFolder)){
  		fs.mkdirSync(funcFolder);
  	}
    if (fs.existsSync(funcFolder+'/terraform.tfstate')){
      funcPublicated = true;
  	  global.shelljs.exec('mv '+funcFolder+'/*tfstate* '+global.homedir+'/node_modules/node2faas/terraform');
    }
    var generalParams = '-var "region='+region+'" '+
                        '-var "sourcecode_zip_path='+global.homedir+'/node_modules/node2faas/'+codePath+'" '+
                        '-var "name='+functionName+'" '+
                        '-target=module.node2faas-'+global.provider;

    switch(global.provider) {
				case 'aws':
				  let aws_access_key_id = global.prepare.getCredentialValue('aws_access_key_id');
					let aws_secret_access_key = global.prepare.getCredentialValue('aws_secret_access_key');
          var providerParams = '-var "access_key='+aws_access_key_id+'" '+
					 										 '-var "secret_key='+aws_secret_access_key+'" ';
					break;
        case 'gcp':
				  let json_file = global.prepare.getCredentialValue('json_file');
          let json_data = global.fs.readFileSync('gcp.json');
          let project = JSON.parse(json_data).project_id;
          console.log(method+' function '+functionName+' on Google Cloud Platform...');
          var providerParams = '-var "project='+project+'" ';
					break;
        case 'azure':
  				  let subscription_id = global.prepare.getCredentialValue('subscription_id');
            let tenant_id = global.prepare.getCredentialValue('tenant_id');
            let client_id = global.prepare.getCredentialValue('client_id');
            let client_secret = global.prepare.getCredentialValue('client_secret');
            var providerParams = '-var "subscription_id='+subscription_id+'" '+
                                 '-var "tenant_id='+tenant_id+'" '+
                                 '-var "client_id='+client_id+'" '+
                                 '-var "client_secret='+client_secret+'" ';
  					break;
				default:
				  console.log('Error: Sorry, this provider is not available! (publishing)');
					process.exit(2);
		}

    if (method!='destroy' && funcPublicated){
      global.common.debug('Function '+functionName+' is beeing destroyed on '+global.provider);
      global.shelljs.exec('cd ~/node_modules/node2faas/terraform ;'+
                              global.terraform+' destroy -auto-approve '+
                              providerParams + generalParams, {silent:!global.debug});
    }
    console.log(method+' function '+functionName+' on '+global.provider+'...');
    result = global.shelljs.exec('cd ~/node_modules/node2faas/terraform ;'+
                            global.terraform+' '+global.method+' -auto-approve '+
                            providerParams + generalParams, {silent:!global.debug});
    result = result.stdout+result.stderr
    global.shelljs.exec('mv ~/node_modules/node2faas/terraform/*tfstate* '+funcFolder);
    if (global.method=='apply') {
      checkPublicationErrors(result,functionName);
      let data = {'functionName': functionName ,
  		            'url': result.split(global.provider+'_url = ')[1]
                               .split(/(aws|gcp|azure)_url = /)[0]
  								             .trim()
  								             .replace(' ','')
                               .replace('\n','')
  													   .replace('[0m','')
                               .replace('0m','')
                               .replace(/[^a-zA-Z0-9-_\/:.=?]/g, '')};
  		 console.log('Function '+data.functionName+' was created in: '+data.url)
  		return data;
    } else {
      return true;
    }
}

/**
 * Verifies if the publication process reported some errors
 *
 * Searches for errors throws on terraform output passed
 *
 * This function can stop the process if an error is found!
 *
 * @since            0.0.2
 * @memberof         node2faas
 *
 * @param {string} result The output of terraform execution.
 * @param {string} functionName The name of the function.
 */
function checkPublicationErrors(result,functionName){
	if (result.includes('InvalidClientTokenId')){
		console.log('Error: The credentials informed are not correct. Check the provider\'s parameters.');
		process.exit(2);
	}
  if (result.includes('Provided module can\'t be loaded')){
		console.log('Error: Your code can\'t be loaded. Something may be wrong on your function '+functionName);
		process.exit(2);
	}

	if (result.includes('Error:') || result.stderr){
		console.log('Error: '+result.stderr);
		process.exit(2);
	}
}
