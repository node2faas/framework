exports.createLambda = function(functionName, codePath){ 
	return new Promise((resolve, reject) => {
		globalParams = require('./params')
		console.log('Creating Lambda Function: '+functionName);
		var AWS = require('aws-sdk');
		AWS.config.update(globalParams.get('awsRegion'));
		var lambda = new AWS.Lambda();
		var params = {
		  Code: { 
		    ZipFile: fs.readFileSync(codePath)
		  },
		  FunctionName: "Node2FaaS-"+functionName, 
		  Description: "Function "+functionName+" automatic created with Node2FaaS", 
		  Handler: functionName+'.'+functionName, 
		  MemorySize: 128, 
		  Publish: true, 
		  Role: globalParams.get('awsRole'),
		  Runtime: globalParams.get('awsNodeVersion'), 
		  Timeout: 15, 
		  VpcConfig: {
		  }
		 };
		lambda.createFunction(params, function(err, data) {
		   if (!err) {
		   		if (globalParams.get('debug')) { 
			  		console.log("Lambda Function result:\n"); 
			  		console.log(data); 
			  		console.log("---------------\n"); 
				}
				var functionArn = data.FunctionArn;
				var apigateway = new AWS.APIGateway();
				var params = {
				  name: 'Node2FaaS-'+functionName, 
				  apiKeySource: 'HEADER',
				  description: 'STRING_VALUE',
				  endpointConfiguration: {
				    types: [
				      'REGIONAL',
				    ]
				  },
				  minimumCompressionSize: 0,
				  version: '1'
				};
				apigateway.createRestApi(params, function(err, data) {
				  if (!err) {
				  	if (globalParams.get('debug')) { 
				  		console.log("RestAPI result:\n"); 
				  		console.log(data); 
				  		console.log("---------------\n"); 
				  	}
				  	var params = {
					  Action: 'lambda:*', 
					  FunctionName: functionArn, 
					  Principal: 'apigateway.amazonaws.com', 
					  StatementId: 'ID-1',
					  SourceArn: globalParams.get('awsRole')
					};
					lambda.addPermission(params, function(err, data) {
					  if (!err) {
					  	if (globalParams.get('debug')) { console.log(data); }
					  } else { 
					  	console.log('Add permission to Lambda Function failed:\n', err);
					  }
					});
				  	var apiId = data.id
				  	apigateway.getResources({
						restApiId: apiId
						}, function(err, data){
							if (!err) {
								if (globalParams.get('debug')) { 
							  		console.log("APIGateway get root resource:\n"); 
							  		console.log(data); 
							  		console.log("---------------\n"); 
							  	}
								var resourceRootId = data.items[0].id
								apigateway.createResource({
									restApiId: apiId,
									parentId: resourceRootId,
									pathPart: functionName
								}, function(err, data){
									if (!err) {
										if (globalParams.get('debug')) { 
									  		console.log("APIGateway create resource result:\n"); 
									  		console.log(data); 
									  		console.log("---------------\n"); 
										}
										resourceId = data.id;
										apigateway.putMethod({
											restApiId: apiId,
											resourceId: resourceId,
											httpMethod: 'ANY',
											authorizationType: 'NONE'
										}, function(err, data){
											if (!err) {
												if (globalParams.get('debug')) { 
											  		console.log("APIGateway method result:\n"); 
											  		console.log(data); 
											  		console.log("---------------\n"); 
												}
												apigateway.putMethodResponse({
													restApiId: apiId,
													resourceId: resourceId,
													httpMethod: 'ANY',
													statusCode: '200',
													responseModels: {
													    'application/json': 'Empty',
													  },
												}, function(err, data){
													if (!err) {
														if (globalParams.get('debug')) { 
													  		console.log("APIGateway method response result:\n"); 
													  		console.log(data); 
													  		console.log("---------------\n"); 
														}
														apigateway.putIntegration({
															restApiId: apiId,
															resourceId: resourceId,
															httpMethod: 'ANY',
															type: 'AWS',
															integrationHttpMethod: 'POST',
															uri: 'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/'+functionArn+'/invocations',
															credentials: globalParams.get('awsRole'),
														}, function(err, data){
															if (!err) {
																if (globalParams.get('debug')) { 
															  		console.log("APIGateway integration result:\n"); 
															  		console.log(data); 
															  		console.log("---------------\n"); 
																}
																apigateway.putIntegrationResponse({
																	restApiId: apiId,
																	resourceId: resourceId,
																	httpMethod: 'ANY',
																	statusCode: '200',
																	selectionPattern: ''
																}, function(err, data){
																	if (!err) {
																		if (globalParams.get('debug')) { 
																	  		console.log("APIGateway integration response result:\n"); 
																	  		console.log(data); 
																	  		console.log("---------------\n"); 
																		}
																		var params = {
																		  restApiId: apiId, 
																		 }
																		apigateway.createDeployment(params, function(err, data) {
																		  if (!err) { 
																		  		if (globalParams.get('debug')) { 
																			  		console.log("APIGateway deployment result:\n"); 
																			  		console.log(data); 
																			  		console.log("---------------\n"); 
																				}
																		  		var deploymentId = data.id
																		  		var params = {
																				  deploymentId: deploymentId, 
																				  restApiId: apiId, 
																				  stageName: 'default', 
																				};
																				apigateway.createStage(params, function(err, data) {
																				  if (!err) {
																				  	var url = "https://"+apiId+".execute-api."+globalParams.get('awsRegion').region+".amazonaws.com/default/"+functionName;
																					if (globalParams.get('debug')) { 
																				  		console.log("APIGateway stage result:\n"); 
																				  		console.log(data); 
																				  		console.log('URL: '+url);
																						console.log("---------------\n"); 	
																					}
																					resolve(url);
																				  } else {
																				  	console.log("The apigateway stage creation failed:\n", err); 
																				  }     
																				});
																		  } else {
																		  	console.log("The apigatewaz deployment creation failed:\n", err);
																		  }
																		});
																	} else
																		console.log("The apigateway method integration response setup failed:\n", err);
																})
															} else {
																console.log("The apigateway method integration setup failed:\n", err);
															}
														})
													} else {
														console.log("Set up the 200 OK response for the apigateway method failed:\n", err);
													}
												})
											} else {
												console.log("The apigateway method setup failed:\n", err);
											}	
										})
									} else {
										console.log("The apigateway resource setup failed:\n", err);
									}	
								})
							} else {
								console.log('Get apigateway root resource failed:\n', err);
							} 
					})
				  	} else {
				  		console.log('APIGateway creation failed:\n', err);
				  	}
				});
		   } else {
		   		console.log('Lambda Function creation failed:\n', err); 
		   }
		 });
	});
}