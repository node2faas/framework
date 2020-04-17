for i in {1..10}; do
  ./workload1.sh >> workload1_$i.log 
  ./workload2.sh >> workload2_$i.log
done
