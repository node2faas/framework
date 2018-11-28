#!/bin/bash
NR_REQUESTS=$1
URLS='localhost:3030 localhost:3000'
CALLS='mem_load cpu_load io_load'
FOLDER=outputs/$(gdate +%Y-%m-%d-%T-%N)/
for i in $URLS; do
	label=`echo $i | sed -e "s/\//-/g"` 
	echo "Stressing ($NR_REQUESTS times) - $i"
	for x in $CALLS; do
		echo "Call $x..."
        mkdir -p "$FOLDER/$label"
    	touch "$FOLDER/$label/$x"
		CONT=0
  		while [ $CONT -le $NR_REQUESTS ]; do
    		echo "req... $CONT"
    		./call.sh "http://$i/$x" "$FOLDER/$label/$x" &
    		CONT=$((CONT + 1))
  		done
  	done
done