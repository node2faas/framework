/************************************************
 * Process that analyze a code in order to
 * decide if it will be converted to FaaS or not.
 *
 * @since      0.0.2
 * @memberof   node2faas
 *
 ***********************************************/

/**
 *
 * Controls the code analyzis process
 *
 * @since      0.0.2
 * @access     private
 * @memberof   node2faas
 *
 * @param 		 {hash}    func   A function with: name, parameters and algoritm.
 * @return     {boolean} 	      Return true if function is able to be converted.
 */
exports.analyzeFunction = function(func){
    //  Check annotation
    //  Check if skip is active
    if (func.algoritm.includes("//@node2faas-skip")){
        return false
    }

    //  Check if force is active
    if (func.algoritm.includes("//@node2faas-force")){
        return true
    }

    // This minimal size was calculated based on tests conducted using real functions available on GitHub
    const minSize = 2220

    // Include functions with a minimal size
    if (func.algoritm.length > minSize){
        return true
    }

    // Include functions whose loops depends from theirs parameters
    if (func.parameters.length){
        const loops = extractLoops(func.algoritm)
        for (const i in func.parameters){
            for (const x in loops){
                try{
                    if (loops[x].search(func.parameters[i])!=-1){
                        return true
                    }
                } catch (err){
                    global.common.debug(err)
                }
            }
        }
    }
    return false
}

/**
 *
 * Extracts Loops selections from a code
 *
 * @since      0.0.2
 * @access     private
 * @memberof   node2faas
 *
 * @param 		 {String}    code   An algoritm (code).
 * @return     {String[]} 	      A list of loop selections strings.
 */
function extractLoops(code){
    const listLoops = []
    let tmp = ""
    //Take "for" with space(s) between the parentesys
    if (code.search(/for[ ]+[(]/)!=-1){
        tmp = code.split(/for[ ]+[(]/)
        tmp.shift()
        for (const i in tmp){
            const s1 = tmp[i].search(/[{]/)
            const selection = tmp[i].substring(0,s1)
            listLoops.push(selection)
        }
    }
    //Take "for" without space between the parentesys
    if (code.search(/for[(]/)!=-1){
        tmp = code.split(/for[(]/)
        tmp.shift()
        for (const i in tmp){
            const s1 = tmp[i].search(/[{]/)
            const selection = tmp[i].substring(0,s1)
            listLoops.push(selection)
        }
    }
    //Take "while" without space between the parentesys
    if (code.search(/while[(]/)!=-1){
        tmp = code.split(/while[(]/)
        tmp.shift()
        for (const i in tmp){
            const s1 = tmp[i].search(/[{]/)
            const selection = tmp[i].substring(0,s1)
            listLoops.push(selection)
        }
    }
    //Take "while" with space(s) between the parentesys
    if (code.search(/while[ ]+[(]/)!=-1){
        tmp = code.split(/while[ ]+[(]/)
        tmp.shift()
        for (const i in tmp){
            const s1 = tmp[i].search(/[{]/)
            const selection = tmp[i].substring(0,s1)
            listLoops.push(selection)
        }
    }
    return listLoops
}
