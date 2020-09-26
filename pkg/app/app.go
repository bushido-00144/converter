package app

import (
	"converter/pkg/ffmpeg"
	"converter/pkg/metadata"
	"converter/pkg/response"
	"converter/pkg/zip"
	"fmt"
	"html/template"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

type ConverterApp struct {
	tmpWavDir string
	tmpMp3Dir string
}

func NewConverterApp() *ConverterApp {
	converterApp := ConverterApp{
		tmpWavDir: "/tmp/converter/wav/",
		tmpMp3Dir: "/tmp/converter/mp3/",
	}
	return &converterApp
}

func (c *ConverterApp) IndexHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("static/html/index.html")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		io.WriteString(w, "failed load template")
	}
	if err := tmpl.Execute(w, struct {
		Title string
	}{
		Title: "Converter",
	}); err != nil {
		io.WriteString(w, "failed execute template")
	}
}

func (c *ConverterApp) createSavedFile(filename string) (*os.File, error) {
	filePath := strings.Split(filename, "/")
	dir := strings.Join(filePath[:len(filePath)-1], "/")
	err := os.MkdirAll(c.tmpWavDir+dir, 0777)
	if err != nil {
		return nil, fmt.Errorf("failed to create dir: %s, %v", dir, err)
	}
	err = os.MkdirAll(c.tmpMp3Dir+dir, 0777)
	if err != nil {
		return nil, fmt.Errorf("failed to create dir: %s, %v", dir, err)
	}
	return os.Create(c.tmpWavDir + filename)
}

func (c *ConverterApp) UploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		io.WriteString(w, "invalid method")
	}
	log.Printf("saving uploaded files")
	albumMetadata := metadata.NewMetadata()
	r.ParseMultipartForm(32 << 20)
	files := r.MultipartForm.File["file"]
	for _, file := range files {
		src, err := file.Open()
		if err != nil {
			log.Printf("failed to open file %v", err)
			io.WriteString(w, "failed to save file")
			w.WriteHeader(http.StatusInternalServerError)
			c.clearnUp()
			break
		}
		defer src.Close()
		dst, err := c.createSavedFile(file.Filename)
		if err != nil {
			log.Printf("failed to create file: %s: %v", file.Filename, err)
			io.WriteString(w, "failed to save file")
			w.WriteHeader(http.StatusInternalServerError)
			c.clearnUp()
			break
		}
		defer dst.Close()
		_, err = io.Copy(dst, src)
		if err != nil {
			log.Printf("failed to copy file: %v", err)
			io.WriteString(w, "failed to save file")
			w.WriteHeader(http.StatusInternalServerError)
			c.clearnUp()
			break
		}
		albumMetadata.SetTrackMetadata(file.Filename)
	}
	log.Printf("uploaded files saved")
	metadataJsonStr, err := albumMetadata.JSONStr()
	if err != nil {
		log.Printf("failed to create JSON: %v", err)
		io.WriteString(w, "failed to create JSON")
		w.WriteHeader(http.StatusInternalServerError)
		c.clearnUp()
	}

	tmpl, err := template.ParseFiles("static/html/edit.html")
	if err != nil {
		io.WriteString(w, "failed load template")
		w.WriteHeader(http.StatusInternalServerError)
		c.clearnUp()
	}
	if err := tmpl.Execute(w, struct {
		Title    string
		Metadata string
	}{
		Title:    "Converter",
		Metadata: metadataJsonStr,
	}); err != nil {
		log.Printf("failed to execute template: %v", err)
		io.WriteString(w, "failed execute template")
		w.WriteHeader(http.StatusInternalServerError)
		c.clearnUp()
	}
}

func (c *ConverterApp) ConvertHandler(w http.ResponseWriter, r *http.Request) {
	defer c.clearnUp()
	if r.Method != "POST" {
		io.WriteString(w, response.CreateResponse(500, "invalid method"))
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	bytes, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("failed to read body: %v", err)
		io.WriteString(w, response.CreateResponse(500, "failed to read body"))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	albumMetadata, err := metadata.GetMetadata(bytes)
	if err != nil {
		log.Printf("failed to parse json: %v", err)
		io.WriteString(w, response.CreateResponse(500, "failedt to parse metadata"))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	for i, _ := range albumMetadata.Discs[0].Tracks {
		err = ffmpeg.ConvertTrack(&albumMetadata.Discs[0].Tracks[i], c.tmpMp3Dir, c.tmpWavDir)
		if err != nil {
			log.Printf("failed to convert wav: %v", err)
			io.WriteString(w, response.CreateResponse(500, "failed to convert wav file"))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}
	zipPath, err := zip.ArchiveFiles(&albumMetadata, c.tmpMp3Dir)
	if err != nil {
		log.Printf("failed archive zip: %v", err)
		io.WriteString(w, response.CreateResponse(500, "failed to archive file"))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	resStr := response.CreateResponse(200, zipPath)
	io.WriteString(w, resStr)
}

func (c *ConverterApp) clearnUp() {
	err := os.RemoveAll(c.tmpWavDir)
	if err != nil {
		log.Printf("failed to remove files: %v\n", err)
	}
}
