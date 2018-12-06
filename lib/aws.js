exports.createLambda = function(){
	console.log('Creating Lambda Function');
	var AWS = require('aws-sdk');
	AWS.config.update({region:'us-east-1'});
	var lambda = new AWS.Lambda();
	/*lambda.addPermission(params, function (err, data) {
  		if (err) 
  			console.log(err, err.stack); // an error occurred
  		else     
  			console.log(data);           // successful response
	});
*/
    var codigo = "exports.subtrai = function(req, res) {var result = req.params.a - req.params.b;res.json(result); };".toString('base64');
	var params = {
	  //Code: "exports.subtrai = function(req, res) {var result = req.params.a - req.params.b;res.json(result); };", 
	  Code: { /* required */
	    //S3Bucket: 'STRING_VALUE',
	    //S3Key: 'STRING_VALUE',
	    //S3ObjectVersion: 'STRING_VALUE',
	    ZipFile: fs.readFileSync('code.zip')
	  },
	  Description: "", 
	  FunctionName: "Node2FaaS-Subtrai2", 
	  Handler: "code.subtrai", // is of the form of the name of your source file and then name of your function handler
	  MemorySize: 128, 
	  Publish: true, 
	  Role: "arn:aws:iam::270561134573:role/lambada", // replace with the actual arn of the execution role you created
	  Runtime: "nodejs4.3", 
	  Timeout: 15, 
	  VpcConfig: {
	  }
	 };
	 lambda.createFunction(params, function(err, data) {
	   if (err) 
	   		console.log(err, err.stack); // an error occurred
	   else     
	   		console.log(data);           // successful response
	   /*
	   data = {
	    CodeSha256: "", 
	    CodeSize: 123, 
	    Description: "", 
	    FunctionArn: "arn:aws:lambda:us-west-2:123456789012:function:MyFunction", 
	    FunctionName: "MyFunction", 
	    Handler: "source_file.handler_name", 
	    LastModified: "2016-11-21T19:49:20.006+0000", 
	    MemorySize: 128, 
	    Role: "arn:aws:iam::123456789012:role/service-role/role-name", 
	    Runtime: "nodejs4.3", 
	    Timeout: 123, 
	    Version: "1", 
	    VpcConfig: {
	    }
	   }
	   */
	 });
}