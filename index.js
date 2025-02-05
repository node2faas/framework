#! /usr/bin/env node
global.debug = false
global.sumary = new Array()
global.filesList = new Array()
global.funcList = new Array()
global.sumary["files"] = 0
global.sumary["funcs_elegibles"] = 0
global.sumary["funcs_not_elegibles"] = 0
global.fs = require("fs")
global.homedir = require("os").homedir()
global.shelljs = require("shelljs")
global.credentials = {}
global.common = require("./lib/common")
global.method = "apply"
global.common.treatParams()
global.provider = "aws"
global.prepare 	= require("./lib/prepare")
global.conversor = require("./lib/conversor")
global.orchestratorFolder = global.homedir+"/.node2faas/terraform/"
global.common.banner()
if (global.target){
    global.target = global.common.cleanDoubleSlashes(global.target)
    global.output = global.common.cleanDoubleSlashes("output/" + global.target.replace(/\.\.\//g,""))
    global.prepare.prepare(global.target,global.output).then(()=>{
        if (global.method == "apply"){
            console.log("-----------------------------------------------------------------------")
            console.log(`Converted app will be avaiable in ${global.output}`)
            console.log("-----------------------------------------------------------------------\n")
            console.log("Analyzing "+global.target+"...\n")
        }
        global.common.downloadDependencies(global.target)
        global.conversor.convert(global.target, global.output)
        global.common.addDependencyToOutput(global.target, global.output , "axios", "0.23.0")
        global.common.downloadDependencies(global.output)
        console.log("Finished!")
        global.common.sumary()
    },function(err){
        console.log("Error: fail on prepare process -> "+err)
    })
} else {
    console.log("Error: Target project not found! \
                \nPlease provide the path of the original application \
                \nType node2faas --help for instructions")
}
