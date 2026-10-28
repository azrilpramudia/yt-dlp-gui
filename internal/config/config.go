package config

import (
	"os"
	"path/filepath"
)

const (
	DefaultOutputTemplate = "%(title)s.%(ext)s"
	DefaultYtDlpPath      = "yt-dlp"
)

type Settings struct {
	OutputDir      string `json:"outputDir"`
	OutputTemplate string `json:"outputTemplate"`
	YtDlpPath      string `json:"ytDlpPath"`
	MaxConcurrent  int    `json:"maxConcurrent"`
}

func DefaultSettings() Settings {
	return Settings{
		OutputTemplate: DefaultOutputTemplate,
		YtDlpPath:      DefaultYtDlpPath,
		MaxConcurrent:  1,
	}
}

func SettingsPath() (string, error) {
	base, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(base, "ytdlp-gui", "settings.json"), nil
}
