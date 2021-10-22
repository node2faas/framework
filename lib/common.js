/******************************************
 * Common functions used in all framework
 *
 * @since      0.0.1
 * @memberof   node2faas
 *
 *****************************************/

/**
  * Prints a banner to identify the framework
  *
  * @since          0.0.1
  * @memberof       node2faas
  */
exports.banner = function() {
    console.log("")
    console.log(" _____________________ Welcome to _____________________")
    console.log("|                                                      |")
    console.log("|  _   _           _      ____  _____           ____   |")
    console.log("| | \\ | | ___   __| | ___|___ \\|  ___|_ _  __ _/ ___|  |")
    console.log("| |  \\| |/ _ \\ / _` |/ _ \\ __) | |_ / _` |/ _` \\___ \\  |")
    console.log("| | |\\  | (_) | (_| |  __// __/|  _| (_| | (_| |___)|  |")
    console.log("| |_| \\_|\\___/ \\__,_|\\___|_____|_|  \\__,_|\\__,_|____/  |")
    console.log("|                                   Node.js framework  |")
    console.log("|______________________________________________________|")
}

/**
 * Prints out a DEBUG message if global debug
 * parameter is setted true
 *
 * @since          0.0.1
 * @memberof       node2faas
 * @param global {boolean} debug A global flag to permit DEBUG messages exibition.
 * @param {string} text The message to shows out
 */
exports.debug = function(text){
    if (global.debug){
        console.log("DEBUG: "+text)
    }
}

/**
 * Treatment to passed params
 *
 * @since          0.0.2
 * @memberof       node2faas
 */
exports.treatParams = function(){
    process.argv.forEach(function(element, index, array){
        switch(element) {
        case "--target":
            if (array[index+1] && array[index+1]!="") {
                global.target = array[index+1]+"/"
            } else {
                console.error("Target project invalid!")
            }
            break
        case "--help":
            exports.help()
            process.exit(0)
            break
        case "-h":
            exports.help()
            process.exit(0)
            break
        case "--destroy":
            global.method = "destroy"
            break
        case "-d":
            global.method = "destroy"
            break
        case "--verbose":
            global.debug = true
            break
        case "-v":
            global.debug = true
            break
        case "-p":
            global.provider = "clean"
            break
        case "--provider":
            global.provider = "clean"
            break
        case "-r":
            global.region = "clean"
            break
        case "--region":
            global.region = "clean"
            break
        case "-c":
            global.provider = "clean"
            cleanProvidersFiles()
            break
        case "--clean":
            global.provider = "clean"
            cleanProvidersFiles()
            break
        default:
        }
    })
}

/**
 * Removes all provider's files
 *
 * @since          0.0.2
 * @memberof       node2faas
 */
function cleanProvidersFiles(){
    const providers = ["aws","gcp","azure"]
    providers.forEach(function(element){
        global.shelljs.exec("rm -rf "+global.homedir+"/."+element)
        console.log(element+" credentials were cleaned!")
    })
    global.shelljs.exec("rm -f ~/.node2faas/provider")
}

/**
 * Shows a Help
 *
 * @since          0.0.2
 * @memberof       node2faas
 */
exports.help = function(){
    exports.banner()
    console.log("|  -------------------- H E L P ---------------------  |")
    console.log("|   This framework reads an Nodejs App, analyzes its   |")
    console.log("|   defined functions and decides if publishes on the  |")
    console.log("|   FaaS provider choosed.                             |")
    console.log("|   Providers availables:                              |")
    console.log("|        - Amazon AWS                                  |")
    console.log("|        - Google Cloud Platform                       |")
    console.log("|        - Microsoft Azure                             |")
    console.log("|   ------------------------------------------------   |")
    console.log("|                      How to use                      |")
    console.log("|     node2faas --target PATH_TO_NODE_APP [OPTIONS]    |")
    console.log("|   ------------------------------------------------   |")
    console.log("|                        Options                       |")
    console.log("|   -h | --help     => Shows this help                 |")
    console.log("|   -c | --clean    => Clean providers and credencials |")
    console.log("|   -d | --destroy  => Destroy functions on FaaS       |")
    console.log("|   -v | --verbose  => Shows debug messages            |")
    console.log("|   -p | --provider NAME => Set default provider       |")
    console.log("|   -r | --region   NAME => Set default region         |")
    console.log("|______________________________________________________|")
}

exports.sumary = function(){
    console.log("Results")
    console.log("Files processed: "+global.sumary["files"])
    global.common.debug(global.filesList)
    console.log("Functions found: "+(global.sumary["funcs_elegibles"]+global.sumary["funcs_not_elegibles"]))
    console.log("Functions elegibles: "+(global.sumary["funcs_elegibles"]))
    console.log("Functions not elegibles: "+(global.sumary["funcs_not_elegibles"]))
    for (const i in global.funcList){
        global.common.debug(JSON.stringify(global.funcList[i]))
    }
}

/**
 * Includes a package dependency on package.json
 *
 * @since            0.1.1
 * @memberof         node2faas
 *
 * @param {string} targetFolder The target folder.
 * @param {string} outputFolder The output folder.
 * @param {string} package The name of the package.
 * @param {string} version The version of the package.
 * 
 */
exports.addDependencyToOutput = (targetFolder, outputFolder, package, version) => {
    const packageJsonFile = `${targetFolder}/package.json`
    const outputPackageJsonFile = `${outputFolder}/package.json`
    let packageJson = {
        dependencies: {}
    }
    if (global.fs.existsSync(packageJsonFile)){ 
        packageJson = JSON.parse(global.fs.readFileSync(packageJsonFile))
    }
    global.fs.mkdirSync(outputFolder,{ recursive: true })
    packageJson.dependencies[package] = `^${version}`
    global.fs.writeFileSync(outputPackageJsonFile, JSON.stringify(packageJson))
}


/**
 * Download node_modules
 *
 * @since            0.1.1
 * @memberof         node2faas
 * @param {string}   folder The folder where project is in.
 */
exports.downloadDependencies = (folder) => {	
    if (global.fs.existsSync(`${folder}/package.json`)) {
        const result = global.shelljs.exec(`cd ${folder} && npm install`,{silent:true}).stdout
        return result
    }
}

/**
 * Removes duplicated slashes from a string
 *
 * @since          0.2.0
 * @memberof       node2faas
 * @param {string}   phrase The phrase.
 */
exports.cleanDoubleSlashes = (phrase) => {
    return phrase.replace(/\/\//g, "/").replace(/\/\//g, "/")
}