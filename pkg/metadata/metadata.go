package metadata

import (
	"encoding/json"
	"strconv"
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
	discNum, trackNumber := parseTrackNumber(wavFileName)
	trackName := strings.TrimRight(strings.Join(strings.Split(wavFileName, " ")[1:], " "), ".wav")

	trackMetadata := TrackMetadata{
		Title: trackName,
		Album: albumTitle,
		Track: trackNumber,
		Disc:  discNum,
		Path:  uploadedFilePath,
	}
	dNum, _ := strconv.Atoi(discNum)
	if len(m.Discs) < dNum {
		m.AddDisc()
	}
	m.Discs[dNum-1].Tracks = append(m.Discs[dNum-1].Tracks, trackMetadata)
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

// ディスク番号とトラック番号を返す
func parseTrackNumber(fileName string) (string, string) {
	trackNumber := strings.Split(fileName, " ")[0]
	if strings.Contains(trackNumber, "-") {
		discTrack := strings.Split(trackNumber, "-")
		return discTrack[0], discTrack[1]
	}
	return "1", trackNumber
}
