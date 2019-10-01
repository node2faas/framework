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
  * @param {type}   var           Description.
  * @param {type}   [var]         Description of optional variable.
  * @param {type}   [var=default] Description of optional variable with default variable.
  * @param {Object} objectVar     Description.
  * @param {type}   objectVar.key Description of a key in the objectVar parameter.
  * @return {type}  Return value description.
  */
exports.banner = function() {
	console.log("Welcome to");
	console.log(" _   _           _      ____  _____           ____  ");
	console.log("| \\ | | ___   __| | ___|___ \\|  ___|_ _  __ _/ ___| ");
	console.log("|  \\| |/ _ \\ / _` |/ _ \\ __) | |_ / _` |/ _` \\___ \\ ");
	console.log("| |\\  | (_) | (_| |  __// __/|  _| (_| | (_| |___) |");
	console.log("|_| \\_|\\___/ \\__,_|\\___|_____|_|  \\__,_|\\__,_|____/ ");
	console.log("");
};

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
	  console.log('DEBUG: '+text);
  }
}
