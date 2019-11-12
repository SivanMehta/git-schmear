for i in {1..100}
do
  echo "I am text file $i / 100" > data/$i.txt
  git add data/*.txt
  git commit -m "added data $i"
done
