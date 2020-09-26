package ffmpeg

import (
	"converter/pkg/metadata"
	"io"
	"log"
	"os"
	"os/exec"
	"strings"
)

func metadataOption(track *metadata.TrackMetadata) []string {
	metadataOptions := []string{}
	if track.Title != "" {
		titleOption := []string{"-metadata", "title=" + track.Title}
		metadataOptions = append(metadataOptions, titleOption...)
	}
	if track.Artist != "" {
		artistOption := []string{"-metadata", "artist=" + track.Artist}
		metadataOptions = append(metadataOptions, artistOption...)
	}
	if track.AlbumArtist != "" {
		albumArtistOption := []string{"-metadata", "album_artist=" + track.AlbumArtist}
		metadataOptions = append(metadataOptions, albumArtistOption...)
	}
	if track.Album != "" {
		albumOption := []string{"-metadata", "album=" + track.Album}
		metadataOptions = append(metadataOptions, albumOption...)
	}
	if track.Year != "" {
		yearOption := []string{"-metadata", "date=" + track.Year}
		metadataOptions = append(metadataOptions, yearOption...)
	}
	if track.Track != "" {
		trackOption := []string{"-metadata", "track=" + track.Track}
		metadataOptions = append(metadataOptions, trackOption...)
	}
	if track.Disc != "" {
		discOption := []string{"-metadata", "disc=" + track.Disc}
		metadataOptions = append(metadataOptions, discOption...)
	}
	if track.Genre != "" {
		genreOption := []string{"-metadata", "genre=" + track.Genre}
		metadataOptions = append(metadataOptions, genreOption...)
	}
	return metadataOptions
}

func ConvertTrack(track *metadata.TrackMetadata, tmpMp3Dir string, tmpWavDir string) error {
	/*
		 	ffmpeg -i "$file_name" -acodec libmp3lame \
				-ar 48000 -ab 256k \
		 		-metadata artist="$artist_name" \
		 		-metadata album_artist="$artist_name" \
		 		-metadata title="$title" \
		 		-metadata track="$track_num" \
				"$mp3_file" < /dev/null
	*/
	track.WavPath = tmpWavDir + strings.TrimLeft(track.Path, "/")
	track.Mp3Path = tmpMp3Dir + strings.TrimRight(strings.TrimLeft(track.Path, "/"), "wav") + "mp3"
	cmdStr := []string{
		"-i",
		track.WavPath,
		"-acodec",
		"libmp3lame",
		"-ar",
		"48000",
		"-ab",
		"256k",
	}
	cmdStr = append(cmdStr, metadataOption(track)...)
	cmdStr = append(cmdStr, track.Mp3Path)
	cmd := exec.Command("ffmpeg", cmdStr...)
	stdin, err := cmd.StdinPipe()
	if err != nil {
		log.Printf("failed to open stdin pipe: %v", err)
	}
	defer stdin.Close()
	//cmd.Stderr = os.Stderr
	devNull, err := os.Open("/dev/null")
	if err != nil {
		log.Printf("failed to open /dev/null: %v", err)
	}
	defer devNull.Close()
	io.Copy(stdin, devNull)
	log.Printf("Converting %s...", track.WavPath)
	err = cmd.Run()
	if err != nil {
		log.Printf("failed to exec cmd: %s\n", err)
	}
	log.Printf("Convert %s is success", track.WavPath)
	return nil
}
