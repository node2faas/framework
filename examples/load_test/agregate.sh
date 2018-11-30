#!/bin/bash
rm -f agregate.csv
EXECS=$(ls outputs/)
EXECS_SEQ=1
for i in $EXECS; do
  SERVERS=$(ls outputs/$i)
  SERVERS_SEQ=1
  for x in $SERVERS; do
  	SERVICES=$(ls outputs/$i/$x)
    for z in $SERVICES; do
    	RESULTS=$(cat outputs/$i/$x/$z)
    	for y in $RESULTS; do
    		if [ "$(echo $y | grep 'Internal')" == "" ] && [ "$(echo $y | grep 'server')" == "" ] && [ "$(echo $y | grep 'error')" == "" ]; then
	    		if [ "$(echo $y | grep 'message')" != "" ]; then
	    			y='error'
	    		fi
    			echo "$EXECS_SEQ,$SERVERS_SEQ,$z,$y" >> agregate.csv
    		fi
    	done
    done
    SERVERS_SEQ=$((SERVERS_SEQ + 1))
  done
  EXECS_SEQ=$((EXECS_SEQ + 1))
done
