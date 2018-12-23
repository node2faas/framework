var AWS = require('aws-sdk');
exports.get = function(param){
	switch(param) {
		case 'debug':
	    	return false
	  	case 'awsNodeVersion':
	    	return 'nodejs8.10'
	  	case 'awsRegion':
	    	return {region:'us-east-1'}
	  	case 'awsRole':
	    	return 'arn:aws:iam::270561134573:role/Node2FaaS'
	  	default:
	    	return false
	} 
}