package main

import (
	"converter/pkg/app"
	"log"
	"net/http"
)

func main() {
	converterApp := app.NewConverterApp()
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/upload", converterApp.UploadHandler)
	http.HandleFunc("/convert", converterApp.ConvertHandler)
	http.HandleFunc("/", converterApp.IndexHandler)
	log.Printf("starting server...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
