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
  if (func.algoritm.search("require[(]")!=-1){
    return false;
  }
	return true;
}
