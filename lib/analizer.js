/************************************************
 * Process the analize a code in order to
 * decide if it will be converted to FaaS or not.
 *
 * @since      0.0.2
 * @memberof   node2faas
 *
 ***********************************************/

/**
 *
 * Controls the code analizis process
 *
 * @since      0.0.2
 * @access     private
 * @memberof   node2faas
 *
 * @param 		 {hash}    func   A function with: name, parameters and algoritm.
 * @return     {boolean} 	      Return true if function is able to be converted.
 */
exports.analizeFunction = function(func){
  let minSize = 10000;

  // Exclude functions with dependencies
  if (func.algoritm.search("require[(]")!=-1){
    return false;
  }

  // Include functions with a minimal size
  if (func.algoritm.length > minSize){
    return true;
  }

  // Include functions whose loops depends from theirs parameters
  if (func.parameters.length){
    var loops = extractLoops(func.algoritm);
    for (var i in func.parameters){
      for (var x in loops){
        if (loops[x].search(func.parameters[i])!=-1){
          return true;
        }
      }
    }
  }

  return false;
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
  let listLoops = [];
  //Take 'for' with space(s) between the parentesys
  if (code.search(/for[ ]+[(]/)!=-1){
    var tmp = code.split(/for[ ]+[(]/);
    tmp.shift();
    for (var i in tmp){
      var s1 = tmp[i].search(/[{]/);
      var selection = tmp[i].substring(0,s1);
      listLoops.push(selection);
    }
  }
  //Take 'for' without space between the parentesys
  if (code.search(/for[(]/)!=-1){
    var tmp = code.split(/for[(]/);
    tmp.shift();
    for (var i in tmp){
      var s1 = tmp[i].search(/[{]/);
      var selection = tmp[i].substring(0,s1);
      listLoops.push(selection);
    }
  }
  //Take 'while' without space between the parentesys
  if (code.search(/while[(]/)!=-1){
    var tmp = code.split(/while[(]/);
    tmp.shift();
    for (var i in tmp){
      var s1 = tmp[i].search(/[{]/);
      var selection = tmp[i].substring(0,s1);
      listLoops.push(selection);
    }
  }
  //Take 'while' with space(s) between the parentesys
  if (code.search(/while[ ]+[(]/)!=-1){
    var tmp = code.split(/while[ ]+[(]/);
    tmp.shift();
    for (var i in tmp){
      var s1 = tmp[i].search(/[{]/);
      var selection = tmp[i].substring(0,s1);
      listLoops.push(selection);
    }
  }
  return listLoops;
}
