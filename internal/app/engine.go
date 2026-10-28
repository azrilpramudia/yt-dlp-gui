package app

import (
	"context"
	"os/exec"
	"strings"
	"time"
)

type EngineStatus struct {
	FFmpegConnected bool   `json:"ffmpegConnected"`
	FFmpegVersion   string `json:"ffmpegVersion"`
	YtDlpConnected  bool   `json:"ytDlpConnected"`
	YtDlpVersion    string `json:"ytDlpVersion"`
}

func (a *App) GetEngineStatus() EngineStatus {
	a.mu.Lock()
	ytDlpPath := a.settings.YtDlpPath
	a.mu.Unlock()
	ctx := a.eventContext()
	status := EngineStatus{}
	if ytDlpPath == "" {
		ytDlpPath = "yt-dlp"
	}
	status.YtDlpVersion, status.YtDlpConnected = probeVersion(ctx, ytDlpPath, "--version", "")
	status.FFmpegVersion, status.FFmpegConnected = probeVersion(ctx, "ffmpeg", "-version", "ffmpeg version ")
	return status
}

func probeVersion(parent context.Context, path, arg, prefix string) (string, bool) {
	ctx, cancel := context.WithTimeout(parent, 3*time.Second)
	defer cancel()
	output, err := exec.CommandContext(ctx, path, arg).Output()
	if err != nil {
		return "", false
	}
	line, _, _ := strings.Cut(strings.TrimSpace(string(output)), "\n")
	line = strings.TrimSpace(line)
	if line == "" {
		return "", false
	}
	if prefix != "" {
		line = strings.TrimPrefix(line, prefix)
		fields := strings.Fields(line)
		if len(fields) == 0 {
			return "", false
		}
		line = fields[0]
	}
	return line, true
}
