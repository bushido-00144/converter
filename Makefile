init:
	wget -O static/css/bulma.min.css https://raw.githubusercontent.com/jgthms/bulma/master/css/bulma.min.css

build:
	go build -o converter cmd/converter/main.go

build-mac:
	GOOS=linux GOARCH=amd64 go build -o converter cmd/converter/main.go

build-container:
	sudo docker build -t converter:latest .
