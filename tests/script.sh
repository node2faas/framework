#!/bin/bash
input="tests.csv"
DT=$(date +%d-%m-%Y_%H-%M-%S)
OUTPUT=results/$DT
mkdir -p $OUTPUT
INNER_APP=/Volumes/Leonardo/Google\ Drive/Mestrado/Projeto/node2faas/tests/apps/local/
GCP_APP=/Volumes/Leonardo/Google\ Drive/Mestrado/Projeto/node2faas/tests/apps/gcp/
AZURE_APP=/Volumes/Leonardo/Google\ Drive/Mestrado/Projeto/node2faas/tests/apps/azure/
AWS_APP=/Volumes/Leonardo/Google\ Drive/Mestrado/Projeto/node2faas/tests/apps/aws/
start_service()
{
  APP=$1
  PROVIDER=$2
  #kills any other service in execution
  if [ $(ps -U leonardocarvalho,root | grep "node server" | grep -v "grep" | wc -l) -gt 0 ]; then
    kill -3 $(ps -U leonardocarvalho,root | grep "node server" | grep -v "grep" | awk -F' ' '{print $1}') $$ > /dev/null 2>&1
  fi
  if [ "$APP" == "Inner Processed" ]; then
    cd "$INNER_APP"
    node server >> /dev/null &
  else
    if [ "$PROVIDER" == "GCP" ]; then
      cd "$GCP_APP"
      node server >> /dev/null &
    fi
    if [ "$PROVIDER" == "AZURE" ]; then
      cd "$AZURE_APP"
      node server >> /dev/null &
    fi
    if [ "$PROVIDER" == "AWS" ]; then
      cd "$AWS_APP"
      node server >> /dev/null &
    fi
  fi
  sleep 2
  cd - > /dev/null
}

exec_test()
{
  WORKLOAD=$1
  CONCURRENCY=$2
  STRESS=$3
  EXECUTIONS=$4
  ID=$5

  case $WORKLOAD in
	"CPU Bound")
		echo "CPU Bound Test"
                WKL=cpu
                case $STRESS in
                  "low (1s)")
                     echo "low (1s)"
                     WKS=999999/555555
                     ;;
                   "medium(5s)")
                     echo "medium(5s)"
                     WKS=6666666/666999
                     ;;
                   "high (10s)")
                     echo "medium(5s)"
                     WKS=15000000/22222
                     ;;
                   *)
                   echo "Error, stress dont exists"
                   exit 1
                   ;;
                esac
		;;
	"Memory Bound")
		echo "Memory Bound Test"
                WKL=memory
                case $STRESS in
                  "low (1s)")
                     echo "low (1s)"
                     WKS=5555/1000
                     ;;
                   "medium(5s)")
                     echo "medium(5s)"
                     WKS=24850/1000
                     ;;
                   "high (10s)")
                     echo "medium(5s)"
                     WKS=44400/1120
                     ;;
                   *)
                   echo "Error, stress dont exists"
                   exit 1
                   ;;
                esac
		;;
        "IO Bound")
                echo "IO Bound Test"
                WKL=io
                case $STRESS in
                  "low (1s)")
                     echo "low (1s)"
                     WKS=40/100
                     ;;
                   "medium(5s)")
                     echo "medium(5s)"
                     WKS=200/100
                     ;;
                   "high (10s)")
                     echo "medium(5s)"
                     WKS=400/100
                     ;;
                   *)
                   echo "Error, stress dont exists"
                   exit 1
                   ;;
                esac
                ;;
	*)
		echo "Error, test dont exists"
    exit 1
		;;
  esac

  URL=http://localhost:3000/$WKL/$WKS
  echo "URL=$URL"
  while [ $EXECUTIONS -gt 0 ]; do
    echo "$EXECUTIONS executions left"
    while [ $CONCURRENCY -gt 0 ]; do
      echo "$CONCURRENCY concurrencies left"
        echo $(T0=$(gdate +%s%N) ; echo "$EXECUTIONS:$CONCURRENCY:value:$(curl -s $URL):$((`gdate +%s%N` - T0))" >> $OUTPUT/$ID) &
      CONCURRENCY=$((CONCURRENCY - 1))
    done
    while [ $(ps | grep "curl -s ${URL}" | grep -v "grep" | wc -l | sed -e 's/ //g') -gt 0 ]; do
      echo -e "\nWaiting for test execution..."
      sleep 1
    done
    EXECUTIONS=$((EXECUTIONS - 1))
    CONCURRENCY=$2
  done
}

while IFS= read -r line
do
  if [ "$line" != "" ]; then
    ID=$(echo "$line" | awk -F, '{print $1}')
    WORKLOAD=$(echo "$line" | awk -F, '{print $2}')
    ENVIRONMENT=$(echo "$line" | awk -F, '{print $3}')
    APP=$(echo "$line" | awk -F, '{print $4}')
    PROVIDER=$(echo "$line" | awk -F, '{print $5}')
    CONCURRENCY=$(echo "$line" | awk -F, '{print $6}')
    STRESS=$(echo "$line" | awk -F, '{print $7}')
    EXECUTIONS=$(echo "$line" | awk -F, '{print $8}')

    echo "Runing test $ID:"
    echo " - WORKLOAD=$WORKLOAD"
    echo " - ENVIRONMENT=$ENVIRONMENT"
    echo " - APP=$APP"
    echo " - PROVIDER=$PROVIDER"
    echo " - CONCURRENCY=$CONCURRENCY"
    echo " - STRESS=$STRESS"
    echo " - EXECUTIONS=$EXECUTIONS"

    start_service "$APP" $PROVIDER
    echo "init:$(date +%s)" >> $OUTPUT/$ID
    exec_test "$WORKLOAD" "$CONCURRENCY" "$STRESS" "$EXECUTIONS" "$ID"
    echo "finish:$(date +%s)" >> $OUTPUT/$ID
  fi
done < "$input"
