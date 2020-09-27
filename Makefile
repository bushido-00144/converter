build:
	go build -o converter cmd/converter/main.go

build-container:
	sudo docker build -t converter:latest .
