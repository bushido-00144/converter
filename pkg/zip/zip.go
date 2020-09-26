package zip

import (
	"converter/pkg/metadata"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
)

func ArchiveFiles(albumMetadata *metadata.AlbumMetadata, mp3TmpDir string) (string, error) {
	mp3DirPath := mp3TmpDir + strings.Split(albumMetadata.Discs[0].Tracks[0].Path, "/")[0]
	zipDirPath := "./" + strings.Split(mp3DirPath, "/")[len(strings.Split(mp3DirPath, "/"))-1]
	zipFileName := "static/files/" + strings.Split(mp3DirPath, "/")[len(strings.Split(mp3DirPath, "/"))-1] + ".zip"
	defer cleanUp(zipDirPath)
	mvCmd := exec.Command("mv", mp3DirPath, zipDirPath)
	err := mvCmd.Run()
	if err != nil {
		log.Printf("failed to mv dir: %v\n", err)
	}
	cmdOptions := []string{
		"-r",
		zipFileName,
		zipDirPath,
	}
	cmd := exec.Command("zip", cmdOptions...)
	err = cmd.Run()
	if err != nil {
		log.Printf("failed archive zip: %v\n", err)
		return "", fmt.Errorf("failed to archive zip")
	}
	return zipFileName, nil
}

func cleanUp(path string) {
	_ = os.RemoveAll(path)
}
