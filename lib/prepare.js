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
  * @param {string}   outputFolder Path of outputFolder.
  * @return {Promisse} (resolve,reject) The result of preparation process.
  */
exports.prepare = function(target, outputFolder) {
    return new Promise((resolve) => {
        createOutputStructure(outputFolder)
        checkDepedencies()
        const provider = getProvider()
        if (!provider){
            setProvider().then(function(){
                checkRegion().then(function(){
                    resolve()
                })
            })
        } else {
            global.provider = provider
            console.log("Provider: "+provider)
            if (!checkCredentials(provider)){
                setCredentials(provider).then(function(){
                    checkRegion().then(function(){
                        resolve()
                    })
                })
            } else {
                checkRegion().then(function(){
                    resolve()
                })
            }
        }
    })
}

/**
 * Check if all dependecies is satisfied
 *
 * @since          0.0.2
 * @memberof       node2faas
 * @return {Boolean}   All is OK.
 */
function checkDepedencies(){
    const checkTerraform = global.shelljs.exec("which terraform",{silent: true}).stdout
    if (!checkTerraform || checkTerraform === "terraform not found"){
        const terraformPath = "~/.terraform/terraform"
        if (global.shelljs.exec(`test -f ${terraformPath} && echo $?`,{silent: true}).stdout=="1\n"){
            global.shelljs.exec("npm install terraform-latest")
            if (global.fs.existsSync("~/.env")) {
                global.shelljs.exec("source ~/.env")
            }
            if (global.fs.existsSync("~/.profile")) {
                global.shelljs.exec("source ~/.profile")
            }
        }
        global.terraform = terraformPath
    } else {
        global.terraform = "terraform"
    }

    if (!global.fs.existsSync(`${global.homedir}/terraform`)) {
        global.fs.mkdirSync(`${global.homedir}/terraform`)
    }

    if (!global.fs.existsSync(`${global.homedir}/terraform/gcp.json`)) {
        global.fs.writeFileSync(`${global.homedir}/terraform/gcp.json`, "")
    }

    if (!global.fs.existsSync(`${global.homedir}/.node2faas`)) {
        global.fs.mkdirSync(`${global.homedir}/.node2faas`)
    }
    return true
}


/**
 * Check if region is setted and call set region process if needed
 *
 * @since          0.0.2
 * @memberof       node2faas
 * @return {Promise}   Region setted.
 */
function checkRegion(){
    return new Promise((resolve) => {
        const region = getRegion()
        if (!region){
            setRegion().then(function(){
                resolve()
            })
        } else {
            global.region = region
            console.log("Region: "+region)
            resolve()
        }
    })
}

/**
 * Creates the output application structure
 * cleaning eventual previous outputed files
 * 
 * @since          0.0.1
 * @memberof       node2faas
 * @param {string}   outputFolder Path of the outputFolder.
 */
function createOutputStructure(outputFolder){
    global.shelljs.exec(`rm -rf ${outputFolder}`, {silent:!global.debug})
    global.fs.mkdirSync(outputFolder,{recursive:true})
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
    if (global.provider == "clean" && global.fs.existsSync(global.homedir+"/.node2faas/provider")){
        global.fs.unlinkSync(global.homedir+"/.node2faas/provider")
        console.log("Default provider was cleaned!")
    }
    if (global.fs.existsSync(global.homedir+"/.node2faas/provider")){
        const file = global.fs.readFileSync(global.homedir+"/.node2faas/provider")
        console.log("Initializing...")
        global.fs.mkdirSync(global.orchestratorFolder,{ recursive: true })
        global.shelljs.exec(`cp -Ru ${__dirname}/../terraform/* ${global.orchestratorFolder}/`)
        global.shelljs.exec(`cd ${global.orchestratorFolder} && ${global.terraform} init`,{silent:!global.debug})
        return file.toString()
    }
    return false
}

/**
 * Get a region defined on local file
 *
 * Try to get region on file, otherwise returns false
 *
 * @since          0.0.2
 * @memberof       node2faas
 *
 * @return {string|boolean} Region"s name or false.
 */
exports.getRegion = function(){return getRegion()}
function getRegion() {
    if (global.region == "clean" && global.fs.existsSync(global.homedir+"/."+global.provider+"/region")){
        global.fs.unlinkSync(global.homedir+"/."+global.provider+"/region")
        console.log("Default region was cleaned!")
    }
    if (global.fs.existsSync(global.homedir+"/."+global.provider+"/region")){
        const file = global.fs.readFileSync(global.homedir+"/."+global.provider+"/region")
        return file.toString().replace("\n","")
    }
    return false
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
    return new Promise((resolve) => {
        console.log("  Please, select a provider:")
        console.log("    1 - Amazon AWS")
        console.log("    2 - Google Cloud Platform (GCP)")
        console.log("    3 - Microsoft Azure")
        const readline = require("readline")
        const rl_key = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        rl_key.question("  Provider: ", (provider_id) => {
            let text_provider = "default"
            switch(provider_id) {
            case "1":
                text_provider = "aws"
                break
            case "2":
                text_provider = "gcp"
                break
            case "3":
                text_provider = "azure"
                break
            default:
                console.log("Error: Sorry, this provider is not available! (setting provider)")
                process.exit(2)
            }
            const stream = global.fs.createWriteStream(global.homedir+"/.node2faas/provider")
            stream.once("open", () => {
                global.provider = text_provider
                stream.write(text_provider)
                stream.end()
                if (!checkCredentials(global.provider)){
                    setCredentials(global.provider).then(function(){
                        resolve()
                    })
                } else {
                    resolve()
                }
            })
            rl_key.close()
        })
    })
}

/**
 * Process to obtain the provider"s region from user
 *
 * Ask user to choose a region to be used when publishing functions
 *
 * @since          0.0.2
 * @memberof       node2faas
 *
 * @return {Promisse} Region selected.
 */
function setRegion() {
    return new Promise((resolve) => {
        const readline = require("readline")
        const rl_key = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        let default_region = "default"
        switch(global.provider) {
        case "aws":
            default_region = "us-east-1"
            break
        case "gcp":
            default_region = "us-central1"
            break
        case "azure":
            default_region = "centralus"
            break
        default:
            console.log("Error: Sorry, this provider is not available! (setting region)")
            process.exit(2)
        }
        rl_key.question("  Region (default ⇨ "+default_region+"): ", (region) => {
            region = (region) ? region : default_region
            global.fs.writeFileSync(global.homedir+"/."+global.provider+"/region", region, { mode: 0o600 })
            rl_key.close()
            resolve()
        })
    })
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
    if (global.fs.existsSync("~/."+provider+"/credentials")){
        return true
    } else {
        return false
    }
}

/**
 * Obtains the globally setted value for a credential parameter
 * for the provider being used
 *
 * If is already setted globally just retuns. If is not setted yet,
 * it will be loaded from the credentials file
 *
 * @since            0.0.2
 * @memberof         node2faas
 *
 * @param global {string[]} credentials List of credentials parameters.
 * @param global {string} provider Name of the provider.
 *
 * @param {string}   param The name of the function.
 * @return {string} The parameter value.
 * @todo Make treatment file is not found
 */
exports.getCredentialValue = function(param){return getCredentialValue(param)}
function getCredentialValue(param){
    if (typeof(global.credentials) == "undefined" || typeof(global.credentials[param]) == "undefined") {
        global.credentials[param] = global.shelljs.cat("~/."+global.provider+"/credentials").grep(param).stdout.replace(param+" = ","").replace(/\n/g,"").trim()
    }
    return global.credentials[param]
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
    const readline_aws = require("readline")
    const rl_key_aws = readline_aws.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    const readline_gcp = require("readline")
    const rl_key_gcp = readline_gcp.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    const readline_azure = require("readline")
    const rl_key_azure = readline_azure.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve) => {
        provider = provider.trim()
        switch(provider) {
        case "aws":
            console.log("  Fill your AWS credencials")
            console.log("  How to obtain: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html")
            rl_key_aws.question("    Access key: ", (aws_access_key_id) => {
                rl_key_aws.question("    Key password: ", (aws_secret_access_key) => {
                    const credentials = `[default] \
                                     \naws_access_key_id = ${aws_access_key_id} \
                                     \naws_secret_access_key = ${aws_secret_access_key} \
                                     \n`
                    if (!global.fs.existsSync(global.homedir+"/."+provider)) {
                        global.fs.mkdirSync(global.homedir+"/."+provider)
                    }
                    global.fs.writeFileSync(global.homedir+"/."+provider+"/credentials", credentials, { mode: 0o600 })
                    resolve()
                })
            })
            break
        case "gcp":
            console.log("  Fill your Google Cloud Platform (GCP) credencials")
            console.log("  How to obtain: https://cloud.google.com/iam/docs/creating-managing-service-account-keys?hl=en")
            rl_key_gcp.question("    JSON file location: ", (json_file) => {
                try {
                    if (global.fs.existsSync(json_file)) {
                        global.common.debug("File "+json_file+" found")
                    } else {
                        console.log("  Error: File "+json_file+" not found, process aborted")
                        process.exit(2)
                    }
                } catch(err){
                    console.log("  Error: Failed on finding file "+json_file+" "+err)
                }
                const credentials = `[default] \
                                    \njson_file = ${json_file} \
                                    \n`
                if (!global.fs.existsSync(global.homedir+"/."+provider)) {
                    global.fs.mkdirSync(global.homedir+"/."+provider)
                }
                global.fs.writeFileSync(global.homedir+"/."+provider+"/credentials", credentials, { mode: 0o600 })
                const gcp_json_file = getCredentialValue("json_file")
                global.fs.copyFile(gcp_json_file, `${global.homedir}/terraform/gcp.json`, (err) => {
                    if (err) throw err
                })
                resolve()
            })
            break
        case "azure":
            console.log("  Fill your Azure credencials")
            console.log("  How to obtain: https://www.inkoop.io/blog/how-to-get-azure-api-credentials/")
            rl_key_azure.question("    Subscription_id: ", (subscription_id) => {
                rl_key_azure.question("    Tenant_id: ", (tenant_id) => {
                    rl_key_azure.question("    Client_id: ", (client_id) => {
                        rl_key_azure.question("    Client_secret: ", (client_secret) => {
                            const credentials = `[default] \
                                                \nsubscription_id = ${subscription_id} \
                                                \ntenant_id = ${tenant_id} \
                                                \nclient_id = ${client_id} \
                                                \nclient_secret = ${client_secret} \
                                                \n`
                            if (!global.fs.existsSync(global.homedir+"/."+provider)) {
                                global.fs.mkdirSync(global.homedir+"/."+provider)
                            }
                            global.fs.writeFileSync(global.homedir+"/."+provider+"/credentials", credentials, { mode: 0o600 })
                            resolve()
                        })
                    })
                })
            })
            break
        default:
            console.log("  Error: Sorry, this provider is not available!")
            process.exit(2)
        }
    })
}
