package metadata

import (
	"encoding/json"
	"strings"
)

type TrackMetadata struct {
	Title       string `json:"title"`
	Artist      string `json:"artist"`
	AlbumArtist string `json:"album_artist"`
	Album       string `json:"album"`
	Year        string `json:"date"`
	Track       string `json:"track"`
	Disc        string `json:"disc"`
	Genre       string `json:"genre"`
	Path        string `json:"path"`
	WavPath     string
	Mp3Path     string
}

type DiscMetadata struct {
	Tracks []TrackMetadata `json:"tracks"`
}

type AlbumMetadata struct {
	Discs []DiscMetadata `json:"discs"`
}

func NewMetadata() AlbumMetadata {
	albumMetadata := AlbumMetadata{}
	albumMetadata.AddDisc()
	return albumMetadata
}

func (m *AlbumMetadata) AddDisc() {
	discMetadata := DiscMetadata{}
	m.Discs = append(m.Discs, discMetadata)
}

func (m *AlbumMetadata) SetTrackMetadata(uploadedFilePath string) {
	wavFilePathSlice := strings.Split(uploadedFilePath, "/")
	// uploadedFilePath はブラウザが送信したディレクトリ構造が入る
	albumTitle := wavFilePathSlice[0]
	wavFileName := wavFilePathSlice[len(wavFilePathSlice)-1]
	trackNumber := strings.Split(wavFileName, " ")[0]
	trackName := strings.TrimRight(strings.Join(strings.Split(wavFileName, " ")[1:], " "), ".wav")

	trackMetadata := TrackMetadata{
		Title: trackName,
		Album: albumTitle,
		Track: trackNumber,
		Path:  uploadedFilePath,
	}
	m.Discs[0].Tracks = append(m.Discs[0].Tracks, trackMetadata)
}

func (m *AlbumMetadata) JSONStr() (string, error) {
	bytes, err := json.Marshal(m)
	return string(bytes), err
}

func GetMetadata(bytes []byte) (AlbumMetadata, error) {
	albumMetadata := AlbumMetadata{}
	err := json.Unmarshal(bytes, &albumMetadata)
	return albumMetadata, err
}
