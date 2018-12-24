rm -f api_ids_remove 
rm -f functions_name_remove 
lambda list-functions | jq '.Functions[].FunctionName' | sed -e 's/"//g' >> functions_name_remove; done
for i in ` cat functions_name_remove | sed -e 's/"//g'`; do aws lambda delete-function --function-name $i; done
aws apigateway get-rest-apis | jq '.items[].id' >> api_ids_remove; done
for i in ` cat api_ids_remove | sed -e 's/"//g'`; do aws apigateway delete-rest-api --rest-api-id $i; sleep 61; done
rm -f api_ids_remove
rm -f functions_name_remove