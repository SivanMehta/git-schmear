for i in {1..10}
do
  echo "I am text file $i / 10" > data/$i.txt
  git add data/*.txt
  git commit -m "Added data/$i.txt
this will form a full fleshed out commit message
with love,
  sivan"
done
