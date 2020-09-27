init:
	wget -O static/css/bulma-rtl.min.css https://raw.githubusercontent.com/jgthms/bulma/master/css/bulma-rtl.min.css

build:
	go build -o converter cmd/converter/main.go

build-container:
	sudo docker build -t converter:latest .
