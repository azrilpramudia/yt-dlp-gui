package app

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"ytdlp-gui/internal/downloader"
)

const (
	EventProgress = "download:progress"
	EventError    = "download:error"
	EventFinished = "download:finished"
)

type App struct {
	mu     sync.Mutex
	ctx    context.Context
	cancel context.CancelFunc
	runner *downloader.Runner
}

func NewApp() *App {
	return &App{runner: &downloader.Runner{YtDlpPath: "yt-dlp"}}
}

func (a *App) Startup(ctx context.Context) { a.ctx = ctx }

// StartDownload starts a download in the background and streams progress events.
func (a *App) StartDownload(options downloader.Options) error {
	options.URL = strings.TrimSpace(options.URL)
	if options.URL == "" {
		return downloader.NewDownloadError("URL tidak boleh kosong")
	}
	if options.OutputDir == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			return downloader.WrapDownloadError(err)
		}
		options.OutputDir = filepath.Join(home, "Downloads")
	}
	if err := os.MkdirAll(options.OutputDir, 0o755); err != nil {
		return downloader.WrapDownloadError(err)
	}

	a.mu.Lock()
	if a.cancel != nil {
		a.mu.Unlock()
		return downloader.NewDownloadError("Unduhan sedang berjalan")
	}
	parent := a.ctx
	if parent == nil {
		parent = context.Background()
	}
	ctx, cancel := context.WithCancel(parent)
	a.cancel = cancel
	a.mu.Unlock()

	go a.runDownload(ctx, cancel, options)
	return nil
}

func (a *App) CancelDownload() {
	a.mu.Lock()
	cancel := a.cancel
	a.mu.Unlock()
	if cancel != nil {
		cancel()
	}
}

func (a *App) runDownload(ctx context.Context, cancel context.CancelFunc, options downloader.Options) {
	defer func() {
		cancel()
		a.mu.Lock()
		a.cancel = nil
		a.mu.Unlock()
	}()

	parser := downloader.NewParser()
	var reported *downloader.DownloadError
	err := a.runner.Run(ctx, options, func(_ string, line string) {
		if strings.HasPrefix(line, "ERROR:") {
			reported = downloader.NewDownloadError(strings.TrimSpace(strings.TrimPrefix(line, "ERROR:")))
			return
		}
		if progress, ok := parser.Feed(line); ok {
			runtime.EventsEmit(a.ctx, EventProgress, progress)
		}
	})
	if reported != nil {
		runtime.EventsEmit(a.ctx, EventError, reported)
		return
	}
	if err != nil {
		if errors.Is(ctx.Err(), context.Canceled) {
			runtime.EventsEmit(a.ctx, EventProgress, downloader.Progress{Phase: downloader.StatusCancelled, ETA: -1})
			return
		}
		runtime.EventsEmit(a.ctx, EventError, downloader.WrapDownloadError(err))
		return
	}
	runtime.EventsEmit(a.ctx, EventProgress, downloader.Progress{Phase: downloader.StatusFinished, Percent: 100, StagePercent: 100, ETA: 0})
	runtime.EventsEmit(a.ctx, EventFinished)
}
