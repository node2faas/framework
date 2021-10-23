/***********************************************
 * Process to convert application"s functions
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
 * @param {string}   outputFolder Path of the output application.
 * @return {Promisse} (resolve,reject) The result of convertion process.
 */
exports.convert = function(target, outputFolder){
    global.fs.readdirSync(target).forEach(file => {
        if (file !== "node_modules"){
            global.sumary["files"]++
            const filename = global.common.cleanDoubleSlashes(target+"/"+file)
            global.filesList.push(filename)
            if (global.fs.lstatSync(filename).isDirectory()){
                this.convert(filename, outputFolder)
            } else {
                conversion("/"+file, target)
            }
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
    const outputFolder = global.output
    const outputSub = global.common.cleanDoubleSlashes(folder).replace(/\.\.\//g, "").replace(outputFolder.replace("output/", ""),"")
    const source = global.common.cleanDoubleSlashes(folder+file)
    const destinationFolder = global.common.cleanDoubleSlashes(outputFolder+outputSub)
    const destination = global.common.cleanDoubleSlashes(outputFolder+outputSub+file)
    let functions = []
    switch(file.split(".")[1]) {
    case "js":
        if (!global.fs.existsSync(`${outputFolder}${outputSub}${file}`)){
            try {
                global.fs.mkdirSync(outputFolder + outputSub, {recursive:true})
                global.fs.copyFileSync(source, destination)
                global.common.debug(`File ${source} was copied to ${destination}`)
            } catch(err) {
                global.common.debug(err)
            }
        }
        loadRequires(file, folder)
        functions = extractFunctions(file, folder, outputFolder)
        functions.forEach(function(func){
            global.common.debug(`Creating zipfile for function ${func.name}`)
            const zipfile = createZipFile(func.name, normalizeCode(func.name, func.algoritm, func.parameters), folder)
            global.common.debug(`File ${zipfile} was created`)
            if (global.method=="apply") {
                const func_publicated = publication(func.name,zipfile)
                global.common.debug(`Function ${func.name} was publicated`)
                const new_code = assemblyFunction(func.name, func.parameters, func_publicated.url)
                global.common.debug(`The new code for function ${func.name} is => \n\n ${new_code}`)
                replaceHashToNewFunctionCode(destination,func.name,new_code)
                global.common.debug(`File ${destination} was updated with new code for function ${func.name}`)
            } else {
                publication(func.name,zipfile)
                global.common.debug(`Function ${func.name} was despublicated`)
            }
        })
        break
    default:
        if (global.method == "apply"){
            if (!global.fs.lstatSync(source).isDirectory()){
                try {
                    if (global.fs.existsSync(source) && global.fs.existsSync(destinationFolder)) {
                        global.fs.copyFileSync(source, destination)
                        global.common.debug(`File ${source} (untouched - just copied to output): ${destination} `)
                    }
                } catch(err) {
                    global.common.debug(`Error: unable to copy untouched file: ${err}`)
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
 * @param {string}   targetFolder Path to the target application.
 * @return {string}  Created file name.
 */
function createZipFile(functionName, content, targetFolder){
    const filePath = "/tmp/node2faas/"
    if (!global.fs.existsSync(filePath)){
        global.fs.mkdirSync(filePath,{recursive:true})
    }
    const AdmZip = require("adm-zip")
    const zip = new AdmZip()
    let filename = ""
    let func_json = ""
    let host_json = ""
    let packageJson = "" 
    switch(global.provider) {
    case "aws":
        filename = functionName+".js"
        zip.addFile(filename, Buffer.alloc(content.length, content), "Function "+functionName+" - automatic code with Node2FaaS")
        if (global.fs.existsSync(`${targetFolder}/node_modules`)){
            zip.addLocalFolder(`${targetFolder}/node_modules`,"node_modules")
        }
        break
    case "gcp":
        filename = "index.js"
        zip.addFile(filename, Buffer.alloc(content.length, content), "Function "+functionName+" - automatic code with Node2FaaS")
        packageJson = (global.fs.existsSync(`${targetFolder}/package.json`)) && global.fs.readFileSync(`${targetFolder}/package.json`, "utf8").toString()  
        zip.addFile("package.json", Buffer.alloc(packageJson.length, packageJson), "Function "+functionName+" package.json - automatic code with Node2FaaS")
        break
    case "azure":
        filename = "index.js"
        func_json = {
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
        }
        host_json = {
            "version": "2.0"
        }
        zip.addFile("host.json", Buffer.alloc(JSON.stringify(host_json).length, JSON.stringify(host_json)), "Function "+functionName+" - automatic code with Node2FaaS")
        zip.addFile(functionName+"/function.json", Buffer.alloc(JSON.stringify(func_json).length, JSON.stringify(func_json)), "Function "+functionName+" - automatic code with Node2FaaS")
        zip.addFile(functionName+"/"+filename, Buffer.alloc(content.length, content), "Function "+functionName+" - automatic code with Node2FaaS")
        if (global.fs.existsSync(`${targetFolder}/node_modules`)){
            zip.addLocalFolder(`${targetFolder}/node_modules`,"node_modules")
        }
        break
    default:
        console.log("Error: Sorry, this provider is not available! (compressing)")
        process.exit(2)
    }
    const zipfile = `${filePath}${filename}.zip`
    zip.writeZip(zipfile)
    return zipfile
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
 * @return {string}  The new function"s code for choose provider.
 * @todo Make treatment on the parameters
 */
function normalizeCode(functionName, code, parameters){
    //  Disable "res" variables
    code = code.replace("res.","//res.","g")
    //  Disable "return" statement
    code = code.replace("return ","//return")
    let strParams = ""
    let newcode = ""
    switch(global.provider) {
    case "aws":
        //  Replace parameters usage to aws version
        for (const i in parameters){
            strParams += `    let ${parameters[i]} = JSON.parse(event.body).${parameters[i]} \n`
        }
        newcode = `\
            \nexports.${functionName} = (event, info, callback) => { \
            \n${strParams} \
            \n${code} \
            \n  const done = (err, res) => callback(null, { \
            \n    statusCode: err ? "400" : "200", \
            \n    body: err ? err.message : JSON.stringify(res), \
            \n    headers: {"Content-Type": "application/json", \
            \n    }, \
            \n  }) \
            \n  done(null,result) \
            \n}`
        break
    case "gcp":
        //  Change "params" to "query" 
        code = code.replace(/params/g,"query")
        //  Replace parameters usage to gcp version
        for (const i in parameters){
            strParams += `    let ${parameters[i]} = (req.body      && req.body.${parameters[i]}    &&  req.body.${parameters[i]}) || \
                                                     (req.params    && req.params.${parameters[i]}  &&  req.params.${parameters[i]}) || \
                                                     (req.params    && req.params.${parameters[i]}  &&  req.params.${parameters[i]}) || \
                                                     (req.query     && req.query.${parameters[i]}   &&  req.query.${parameters[i]}) \n`
        }
        newcode = `\
            \nexports.${functionName} = (req, res) => { \
            \n console.log(JSON.stringify(req.body)) \
            \n${strParams} \
            \n${code} \
            \n  res.status(200).send(JSON.stringify(result)) \
            \n}`
        break
    case "azure":
        code = code.replace(/params/g,"query")
        //  Replace parameters usage to gcp version
        for (const i in parameters){
            strParams += `    let ${parameters[i]} = (req.body      && req.body.${parameters[i]}    &&  req.body.${parameters[i]}) || \
                                                     (req.params    && req.params.${parameters[i]}  &&  req.params.${parameters[i]}) || \
                                                     (req.params    && req.params.${parameters[i]}  &&  req.params.${parameters[i]}) || \
                                                     (req.query     && req.query.${parameters[i]}   &&  req.query.${parameters[i]}) \n`
        }
        code = code.replace(new RegExp("/tmp/", "g"), "D:\\\\home\\\\data\\\\temp")
        newcode = `\
            \nmodule.exports = async function (context, req, res) { \
            \n  context.log("JavaScript HTTP trigger function processed a request for ${functionName}.") \
            \n  ${strParams} \
            \n  ${code} \
            \n  if (result) { \
            \n    context.res = { \
            \n      // status: 200, /* Defaults to 200 */ \
            \n      body: result \
            \n    } \
            \n  } else { \
            \n    context.res = { \
            \n      status: 400, \
            \n      body: result \
            \n   } \
            \n  } \
            \n}`
        break
    default:
        console.log("Provider not available")
        process.exit(1)
    }
    global.common.debug("New function code generated for "+global.provider+": \n"+newcode)
    return newcode
}

/**
 * Splits a function code to a hash
 *
 * Transform the original code in a hash with:
 *   - name: The name of the function
 *   - parameters: An array of the parameters as string
 *   - algoritm: The commands inside the function
 *   Ex: {"name":"...","parameters":"...","algoritm":"..."}
 *
 * @since            0.0.2
 * @memberof         node2faas
 *
 * @param {string}   code The original code of the function.
 * @return {hash}  The hash of the function
 */
function splitFunction(code){
    const name = code.split("=")[0].trim()
    const parameters = new Array()
    let temp = code.split("=")[1]
    if (temp){
        temp = temp.split("{")[0]
            .replace("(","")
            .replace(")","")
            .replace("function","")
            .replace(" ","")
            .trim()
            .split(",").forEach(function(element){
                parameters.push(element.trim())
            })
    }
    let algoritm = code.split("{")
    algoritm.shift()
    algoritm = algoritm.join("{")
    return {"name":name,"parameters":parameters,"algoritm":algoritm}
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
function replaceFunctionCodeToHash(file,functionName,match="exports."){
    const content = global.shelljs.cat(file)
    let content_arr = content.split(match+functionName)
    const left_side = content_arr.shift()
    content_arr = (content_arr.length) ? content_arr.join().split(match) : []
    const middle = (content_arr.length) ? content_arr.shift() : ""
    const right_side = content_arr.join(match)
    let extra = (middle) ? middle.split("").reverse().join("").split("}")[0].split("").reverse().join("").trim() : ""
    const pattern = "\n##!##"+functionName+"/##!##"
    extra = (extra && extra.split("")[0]!=";") ? ";"+extra : extra
    let newcode = left_side+pattern+extra
    newcode += (right_side) ? "\n"+match+right_side : ""
    try {
        global.fs.writeFileSync(file, newcode, { mode: 0o755 })
        global.common.debug("File "+file+" updated")
    } catch(err) {
        console.error("Error: while updating file "+file+" => "+err)
    }
    global.common.debug("Replaced code for function "+functionName+" in file "+file+" is ⬇ \n\n"+newcode)
    return newcode
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
    let content = global.shelljs.cat(file)
    const pattern = "\n##!##"+functionName+"/##!##"
    content = content.replace(pattern,new_code)
    global.fs.writeFileSync(file, content, { mode: 0o755 })
    return content
}

/**
 * Extracts functions definitions on a file
 *
 * Reads a file and searches for function definitions. Returns a list
 * of functions as hashes with name,parameters and algoritm
 *
 * @since            0.0.2
 * @memberof         node2faas
 * @param {string}   file Path of the file.
 * @param {string}   folder Path of the folder.
 * @param {string}   outputFolder The output folder.
 * @return {hash[]}  List of functions hashes.
 */
function extractFunctions(file, folder, outputFolder){
    const analyzer = require("./analyzer")
    global.common.debug("Extracting functions from file "+folder+file)
    const functions = new Array()
    const qtd_exports = global.shelljs.exec("cat "+folder+file+"    | \
                                            grep ^exports.   | \
                                            wc -l            | \
                                            sed -e 's/ //g'  ", {silent:true}).stdout
    let file_content = global.fs.readFileSync(folder+file,"UTF-8").toString() //global.shelljs.exec("cat "+folder+file,{silent:true}).stdout
    file_content = file_content.replace(new RegExp(/\nexports[.]/, "g"),"\nfaasificable.")
    let cont = 2
    while (cont-1 <= qtd_exports){
        let code = global.shelljs.exec(`echo '${file_content.replace(/'/g,"\\'")}'   | \
                                    tr '\n' 'ß'                                     | \
                                    awk -F'faasificable.' '{print $${cont}}'        | \
                                    awk -F'faasificable.' '{print $1}'              | \
                                    tr 'ß' '\n'                                     `, {silent:true}).stdout    
        code = code.split("").reverse().join("").split("}")
        code.shift()
        code = code.join("}").split("").reverse().join("")
        const func = splitFunction(code)
        if (func.name && !global.funcList[func.name]){
            if (analyzer.analyzeFunction(func)){
                console.log("Function "+func.name+" was selected to be published on FaaS")
                functions.push(func)
                global.sumary["funcs_elegibles"]++
            } else {
                global.common.debug(`Function ${func.name} was not selected to be published on FaaS`)
                global.sumary["funcs_not_elegibles"]++
            }
            global.funcList[func.name]=func
        }
        cont++
    }
    if (functions.length){
        global.common.debug("Functions found in file "+folder+file+" ⬇ \n"+JSON.stringify(functions))
        functions.forEach(function(element){
            const outputSub = global.common.cleanDoubleSlashes(folder).replace(/\.\.\//g, "").replace(outputFolder.replace("output/", ""),"")
            replaceFunctionCodeToHash(outputFolder+outputSub+file, element.name)
        })
    } else {
        global.common.debug("File "+file+" there`s no functions")
    }
    return functions
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
    global.common.debug("Extracting requires from file "+file)
    const path_init = file.split("/")[0]
    file = folder+file
    const requires = new Array()
    const qtd_requires = global.shelljs.exec(`cat ${file}     | \
                                            grep "require"  | \
                                            wc -l           | \
                                            sed -e "s/ //g"`, {silent:true}).stdout.replace("\n","")
    global.common.debug("Was found "+qtd_requires+" requires on file "+file)
    let cont = 2
    while (cont-1 <= qtd_requires){
        const code = global.shelljs.exec(`cat ${file}                          | \
                                        tr "\n" "ß"                            | \
                                        awk -F'require' '{print $${cont}}'     | \
                                        awk -F')' '{print $1}'                 | \
                                        sed -e "s/(//g"                        | \
                                        sed -e "s/'//g"                        | \
                                        sed -e "s/"//g"                        | \
                                        sed -e "s/ß//g" `, {silent:true}).stdout
            .replace("./","")
            .replace(/^[.]/,path_init+"/")
            .replace("\n",".js")
        requires.push(code)
        cont++
    }
    return requires
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
    const full_file = folder+file
    global.common.debug("Loading requires in file "+full_file)
    const requires = extractRequires(file,folder)
    if (requires.length){
        global.common.debug("Requires found in file "+full_file+" ⬇ \n "+JSON.stringify(requires))
        requires.forEach(function(req_file) {
            const search_file = folder+req_file
            try {
                if (global.fs.existsSync(search_file)) {
                    global.common.debug("File "+search_file+" found")
                    conversion(req_file,folder)
                } else {
                    global.common.debug("File "+search_file+" not found")
                }
            } catch(err){
                global.common.debug("Failed on finding file "+search_file+" "+err)
            }
        })
    } else {
        global.common.debug("No requires found in file "+full_file)
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
    let preStr = "?n=y"
    let returnString = ""
    switch(global.provider) {
    case "aws":
        returnString =  "    if (typeof res !== \"undefined\") { \
                            \n      res.json(axiosRes.data) \
                            \n    } \
                            \n    resolve(axiosRes.data) \
                            "
        break
    case "gcp":
        returnString =  "    if (typeof res !== \"undefined\") { \
                            \n      res.json(axiosRes.data) \
                            \n    } \
                            \n    resolve(axiosRes.data) \
                            "
        break
    case "azure":
        preStr=""
        returnString =  "    if (typeof res !== \"undefined\") { \
                            \n      res.json(axiosRes.data) \
                            \n    } \
                            \n    resolve(axiosRes.data) \
                            "
        break
    default:
        returnString =  "    if (typeof res !== \"undefined\") { \
                            \n      res.json(axiosRes.data) \
                            \n    } \
                            \n    resolve(axiosRes.data) \
                            "
    }
    let buildStringParameters = ""
    for (const i in parameters){
        buildStringParameters += `if( ${parameters[i]}.params !== undefined ){ \
                            \n  for (const i in ${parameters[i]}.params){ \
                            \n    stringParam += "&"+i+"="+${parameters[i]}.params[i] \
                            \n  } \
                            \n}\n`
    }
    let strParameters = ""
    for (const par in parameters){
        if (parameters[par] !== "res" && parameters[par] !== "req"){
            strParameters += `${parameters[par]}:${parameters[par]},` 
        } else {
            if (parameters[par] === "req"){
                strParameters += "req:{params:req.params},"
            }
        }
    }
    return `\
        \nexports.${functionName} = function(${parameters}){ \
        \n  /**** Function converted by Node2FaaS ****/ \
        \n  return new Promise((resolve, reject) => { \
        \n    let stringParam = "" \
        \n    ${buildStringParameters} \
        \n    const url = "${uri.trim()}${preStr}"+stringParam \
        \n	  const axios = require("axios") \
        \n    axios \
        \n      .post(url, {${strParameters}}) \
        \n      .then(axiosRes => {  \
        \n        ${returnString}  \
        \n      })  \
        \n      .catch(error => {  \
        \n        if (typeof res !== "undefined") { \
        \n          console.log(error) \
        \n          res.status(500).json(error) \
        \n        } else { \
        \n          console.log(error) \
        \n          reject(error)      
        \n        } \
        \n      })  \
        \n  })  \
        \n}`
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
    let result
    const method = (global.method=="apply") ? "Publishing" : "Destroying"
    const region = global.prepare.getRegion()
    const funcFolder = global.homedir+"/.node2faas/.exec-"+global.provider+"-"+functionName
    let funcPublicated = false

    if (!global.fs.existsSync(funcFolder)){
        global.fs.mkdirSync(funcFolder,{ recursive: true })
    }

    if (global.fs.existsSync(`${funcFolder}/terraform.tfstate`)){
        funcPublicated = true
        global.shelljs.exec(`mv ${funcFolder}/*tfstate* ${global.orchestratorFolder}`)
    }
    const generalParams = ` -var "region=${region}" \
                            -var "sourcecode_zip_path=${codePath}" \
                            -var "name=${functionName}" \
                            -target=module.node2faas-${global.provider} `
    
    let aws_access_key_id = null
    let aws_secret_access_key = null
    let providerParams = null
    let json_file = null
    let subscription_id = null
    let tenant_id = null
    let client_id = null
    let client_secret = null
        
    switch(global.provider) {
    case "aws":
        aws_access_key_id = global.prepare.getCredentialValue("aws_access_key_id")
        aws_secret_access_key = global.prepare.getCredentialValue("aws_secret_access_key")
        providerParams = `-var "access_key=${aws_access_key_id}" \
                              -var "secret_key=${aws_secret_access_key}" `
        break
    case "gcp":
        json_file = process.cwd() + "/" + global.prepare.getCredentialValue("json_file")
        if (global.fs.existsSync(json_file)){
            try {
                const json_data = global.fs.readFileSync(json_file, "utf8").toString()
                const project = JSON.parse(json_data).project_id
                providerParams = `-var "project=${project}" \
                                    -var "credential_file_path=${json_file}" `
            } catch (err){
                console.log(`Error: failed on authentication: ${err}`)
                process.exit(2)
            }
        } else {
            console.log(`Error: credential file ${json_file} was not found`)
            process.exit(2)
        }
        break
    case "azure":
        subscription_id = global.prepare.getCredentialValue("subscription_id")
        tenant_id = global.prepare.getCredentialValue("tenant_id")
        client_id = global.prepare.getCredentialValue("client_id")
        client_secret = global.prepare.getCredentialValue("client_secret")
        providerParams = `-var "subscription_id=${subscription_id}" \
                                -var "tenant_id=${tenant_id}" \
                                -var "client_id=${client_id}" \
                                -var "client_secret=${client_secret}" `
        break


       

    default:
        console.log("Error: Sorry, this provider is not available! (publishing)")
        process.exit(2)
    }

    if (method!="destroy" && funcPublicated){
        global.common.debug("Function "+functionName+" is beeing destroyed on "+global.provider)
        global.shelljs.exec(`cd ${global.orchestratorFolder} && `+
                                `${global.terraform} destroy -auto-approve `+
                                providerParams + generalParams, {silent:!global.debug})
    }
    console.log(`${method} function ${functionName} on ${global.provider} ...`)
    result = global.shelljs.exec(`cd ${global.orchestratorFolder} && `+
                            `${global.terraform} ${global.method} -auto-approve `+
                            providerParams + generalParams, {silent:!global.debug})
    result = result.stdout+result.stderr

    if (global.fs.existsSync(`${global.orchestratorFolder}/terraform.tfstate`)){
        global.shelljs.exec(`mv ${global.orchestratorFolder}/*tfstate* ${funcFolder}`)
    }

    if (global.method=="apply") {
        checkPublicationErrors(result,functionName)
        const data = {"functionName": functionName ,
            "url": result.split(global.provider+"_url = ")[1]
                .split(/(aws|gcp|azure)_url = /)[0]
                .trim()
                .replace(" ","")
                .replace("\n","")
                .replace("[0m","")
                .replace("0m","")
                .replace(/[^a-zA-Z0-9-_/:.=?]/g, "")}
        console.log("Function "+data.functionName+" was created in: "+data.url)
        return data
    } else {
        return true
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
    if (result.includes("InvalidClientTokenId")){
        console.log("Error: The credentials informed are not correct. Check the provider's parameters.")
        process.exit(2)
    }
    if (result.includes("Provided module can not be loaded")){
        console.log("Error: Your code can not be loaded. Something may be wrong on your function "+functionName)
        process.exit(2)
    }

    if (result.includes("Error:") || result.stderr){
        let text = result.split("Error:")[1]
        text = text.split("\n")[0]
        console.log("Error: "+text)
        process.exit(2)
    }
}