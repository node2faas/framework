rm -f api_ids_remove 
rm -f functions_name_remove 

#aws lambda list-functions | jq '.Functions[].FunctionName' > functions_name_remove
for i in {14..79}; do aws lambda list-functions | jq '.Functions[] | select(.FunctionName=="Node2FaaS-func_name'$i'") | .FunctionName' | sed -e 's/"//g' >> functions_name_remove; done
for i in ` cat functions_name_remove | sed -e 's/"//g'`; do aws lambda delete-function --function-name $i; done


for i in {68..79}; do aws apigateway get-rest-apis | jq '.items[] | select(.name=="Node2FaaS-func_name'$i'") | .id' >> api_ids_remove; done
for i in ` cat api_ids_remove | sed -e 's/"//g'`; do aws apigateway delete-rest-api --rest-api-id $i; sleep 61; done

rm -f api_ids_remove 
rm -f functions_name_remove 

