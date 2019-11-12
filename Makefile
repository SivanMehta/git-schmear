reset:
	rm -rf .git
	rm data/*.txt
	git init
	git add .
	git commit -m "initial files"
	sh run.sh
