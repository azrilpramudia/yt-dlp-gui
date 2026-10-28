package app

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"ytdlp-gui/internal/config"
	"ytdlp-gui/internal/downloader"
	"ytdlp-gui/internal/storage"
)

const (
	EventProgress = "download:progress"
	EventError    = "download:error"
	EventQueue    = "download:queue"
)

type task struct {
	id               string
	options          downloader.Options
	binaryPath       string
	progress         downloader.Progress
	errMessage       string
	ctx              context.Context
	cancel           context.CancelFunc
	process          *os.Process
	running          bool
	paused           bool
	phaseBeforePause downloader.Status
}

type App struct {
	mu            sync.Mutex
	ctx           context.Context
	tasks         map[string]*task
	order         []string
	maxConcurrent int
	settings      config.Settings
	settingsPath  string
}

func NewApp() *App {
	settings := config.DefaultSettings()
	settingsPath, _ := config.SettingsPath()
	if settingsPath != "" {
		var saved config.Settings
		if storage.ReadJSON(settingsPath, &saved) == nil {
			if saved.OutputTemplate != "" {
				settings.OutputTemplate = saved.OutputTemplate
			}
			if saved.YtDlpPath != "" {
				settings.YtDlpPath = saved.YtDlpPath
			}
			settings.OutputDir = saved.OutputDir
			if saved.MaxConcurrent >= 1 && saved.MaxConcurrent <= 4 {
				settings.MaxConcurrent = saved.MaxConcurrent
			}
		}
	}
	return &App{
		tasks:         make(map[string]*task),
		maxConcurrent: settings.MaxConcurrent,
		settings:      settings,
		settingsPath:  settingsPath,
	}
}

func (a *App) Startup(ctx context.Context) {
	a.mu.Lock()
	a.ctx = ctx
	a.mu.Unlock()
}

func (a *App) SelectDownloadFolder() (string, error) {
	a.mu.Lock()
	ctx := a.ctx
	a.mu.Unlock()
	if ctx == nil {
		return "", downloader.NewDownloadError("Aplikasi belum siap")
	}
	folder, err := runtime.OpenDirectoryDialog(ctx, runtime.OpenDialogOptions{
		Title:                "Pilih folder unduhan",
		CanCreateDirectories: true,
	})
	if err != nil {
		return "", downloader.WrapDownloadError(err)
	}
	return folder, nil
}

func (a *App) SelectYtDlpBinary() (string, error) {
	a.mu.Lock()
	ctx := a.ctx
	a.mu.Unlock()
	if ctx == nil {
		return "", downloader.NewDownloadError("Aplikasi belum siap")
	}
	path, err := runtime.OpenFileDialog(ctx, runtime.OpenDialogOptions{Title: "Pilih binary yt-dlp"})
	if err != nil {
		return "", downloader.WrapDownloadError(err)
	}
	return path, nil
}

func (a *App) GetSettings() config.Settings {
	a.mu.Lock()
	defer a.mu.Unlock()
	return a.settings
}

func (a *App) SaveSettings(settings config.Settings) error {
	settings.OutputTemplate = strings.TrimSpace(settings.OutputTemplate)
	settings.YtDlpPath = strings.TrimSpace(settings.YtDlpPath)
	if settings.OutputTemplate == "" {
		return downloader.NewDownloadError("Template output tidak boleh kosong")
	}
	if settings.YtDlpPath == "" {
		return downloader.NewDownloadError("Path yt-dlp tidak boleh kosong")
	}
	if settings.MaxConcurrent < 1 || settings.MaxConcurrent > 4 {
		return downloader.NewDownloadError("Jumlah unduhan bersamaan harus antara 1 dan 4")
	}
	a.mu.Lock()
	if a.settingsPath == "" {
		a.mu.Unlock()
		return downloader.NewDownloadError("Lokasi file pengaturan tidak tersedia")
	}
	if err := storage.WriteJSON(a.settingsPath, settings); err != nil {
		a.mu.Unlock()
		return downloader.WrapDownloadError(err)
	}
	a.settings = settings
	a.maxConcurrent = settings.MaxConcurrent
	started := a.dispatchLocked()
	a.mu.Unlock()
	a.emitQueue()
	a.launch(started)
	return nil
}

// SetQueueConcurrency selects how many downloads can run at once (1 to 4).
func (a *App) SetQueueConcurrency(count int) error {
	if count < 1 || count > 4 {
		return downloader.NewDownloadError("Jumlah unduhan bersamaan harus antara 1 dan 4")
	}
	a.mu.Lock()
	if a.settingsPath == "" {
		a.mu.Unlock()
		return downloader.NewDownloadError("Lokasi file pengaturan tidak tersedia")
	}
	settings := a.settings
	settings.MaxConcurrent = count
	if err := storage.WriteJSON(a.settingsPath, settings); err != nil {
		a.mu.Unlock()
		return downloader.WrapDownloadError(err)
	}
	a.settings = settings
	a.maxConcurrent = count
	started := a.dispatchLocked()
	a.mu.Unlock()
	a.emitQueue()
	a.launch(started)
	return nil
}

func (a *App) StartDownload(options downloader.Options) (string, error) {
	options.URL = strings.TrimSpace(options.URL)
	if options.URL == "" {
		return "", downloader.NewDownloadError("URL tidak boleh kosong")
	}
	if options.AudioOnly {
		switch options.AudioFormat {
		case "", "mp3", "m4a", "opus", "wav", "flac":
		default:
			return "", downloader.NewDownloadError("Format audio tidak didukung")
		}
	}
	a.mu.Lock()
	if options.OutputTemplate == "" {
		options.OutputTemplate = a.settings.OutputTemplate
	}
	binaryPath := a.settings.YtDlpPath
	if options.OutputDir == "" {
		options.OutputDir = a.settings.OutputDir
	}
	a.mu.Unlock()
	if options.OutputDir == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			return "", downloader.WrapDownloadError(err)
		}
		options.OutputDir = filepath.Join(home, "Downloads")
	}
	if err := os.MkdirAll(options.OutputDir, 0o755); err != nil {
		return "", downloader.WrapDownloadError(err)
	}

	id, err := newID()
	if err != nil {
		return "", downloader.WrapDownloadError(err)
	}
	item := &task{
		id:         id,
		options:    options,
		binaryPath: binaryPath,
		progress:   downloader.Progress{Phase: downloader.StatusQueued, ETA: -1, Indeterminate: true},
	}
	a.mu.Lock()
	a.tasks[id] = item
	a.order = append(a.order, id)
	started := a.dispatchLocked()
	a.mu.Unlock()
	a.emitQueue()
	a.launch(started)
	return id, nil
}

func (a *App) CancelDownload(id string) error {
	a.mu.Lock()
	item := a.tasks[id]
	if item == nil {
		a.mu.Unlock()
		return downloader.NewDownloadError("Unduhan tidak ditemukan")
	}
	if item.progress.Phase == downloader.StatusFinished || item.progress.Phase == downloader.StatusFailed || item.progress.Phase == downloader.StatusCancelled {
		a.mu.Unlock()
		return nil
	}
	if item.running {
		cancel := item.cancel
		a.mu.Unlock()
		if cancel != nil {
			cancel()
		}
		return nil
	}
	item.progress.Phase = downloader.StatusCancelled
	a.mu.Unlock()
	a.emitQueue()
	return nil
}

func (a *App) PauseDownload(id string) error {
	a.mu.Lock()
	item := a.tasks[id]
	if item == nil || !item.running {
		a.mu.Unlock()
		return downloader.NewDownloadError("Unduhan tidak sedang berjalan")
	}
	if item.paused {
		a.mu.Unlock()
		return nil
	}
	item.paused = true
	item.phaseBeforePause = item.progress.Phase
	process := item.process
	item.progress.Phase = downloader.StatusPaused
	if process != nil {
		if err := downloader.PauseProcess(process); err != nil {
			item.paused = false
			item.progress.Phase = item.phaseBeforePause
			a.mu.Unlock()
			a.emitQueue()
			return downloader.WrapDownloadError(err)
		}
	}
	a.mu.Unlock()
	a.emitQueue()
	return nil
}

func (a *App) ResumeDownload(id string) error {
	a.mu.Lock()
	item := a.tasks[id]
	if item == nil || !item.running || !item.paused {
		a.mu.Unlock()
		return downloader.NewDownloadError("Unduhan tidak sedang dijeda")
	}
	process := item.process
	if process != nil {
		if err := downloader.ResumeProcess(process); err != nil {
			a.mu.Unlock()
			return downloader.WrapDownloadError(err)
		}
	}
	item.paused = false
	item.progress.Phase = item.phaseBeforePause
	a.mu.Unlock()
	a.emitQueue()
	return nil
}

func (a *App) dispatchLocked() []*task {
	running := 0
	for _, item := range a.tasks {
		if item.running {
			running++
		}
	}
	var started []*task
	for _, id := range a.order {
		if running >= a.maxConcurrent {
			break
		}
		item := a.tasks[id]
		if item == nil || item.running || item.progress.Phase != downloader.StatusQueued {
			continue
		}
		parent := a.ctx
		if parent == nil {
			parent = context.Background()
		}
		ctx, cancel := context.WithCancel(parent)
		item.ctx = ctx
		item.cancel = cancel
		item.running = true
		started = append(started, item)
		running++
	}
	return started
}

func (a *App) launch(items []*task) {
	for _, item := range items {
		go a.runDownload(item)
	}
}

func (a *App) runDownload(item *task) {
	a.mu.Lock()
	ctx := item.ctx
	cancel := item.cancel
	a.mu.Unlock()

	parser := downloader.NewParser()
	var reported *downloader.DownloadError
	var processErr error
	runner := &downloader.Runner{YtDlpPath: item.binaryPath}
	err := runner.RunWithProcess(ctx, item.options, func(_ string, line string) {
		if strings.HasPrefix(line, "ERROR:") {
			reported = downloader.NewDownloadError(strings.TrimSpace(strings.TrimPrefix(line, "ERROR:")))
			return
		}
		if progress, ok := parser.Feed(line); ok {
			a.updateProgress(item, progress)
		}
	}, func(process *os.Process) {
		a.mu.Lock()
		item.process = process
		if item.paused {
			processErr = downloader.PauseProcess(process)
		}
		a.mu.Unlock()
	})

	phase := downloader.StatusFinished
	message := ""
	switch {
	case processErr != nil:
		phase, message = downloader.StatusFailed, processErr.Error()
	case reported != nil:
		phase, message = downloader.StatusFailed, reported.Error()
	case err != nil && errors.Is(ctx.Err(), context.Canceled):
		phase = downloader.StatusCancelled
	case err != nil:
		phase, message = downloader.StatusFailed, err.Error()
	}
	cancel()
	a.mu.Lock()
	item.cancel = nil
	item.process = nil
	item.running = false
	item.paused = false
	item.progress.Phase = phase
	if phase == downloader.StatusFinished {
		item.progress.Percent = 100
		item.progress.StagePercent = 100
		item.progress.Indeterminate = false
	}
	item.errMessage = message
	started := a.dispatchLocked()
	a.mu.Unlock()
	if phase == downloader.StatusFailed {
		runtime.EventsEmit(a.eventContext(), EventError, downloader.DownloadFailure{ID: item.id, Message: message})
	}
	a.emitQueue()
	a.launch(started)
}

func (a *App) updateProgress(item *task, progress downloader.Progress) {
	a.mu.Lock()
	if item.paused {
		item.phaseBeforePause = progress.Phase
		progress.Phase = downloader.StatusPaused
	}
	item.progress = progress
	a.mu.Unlock()
	runtime.EventsEmit(a.eventContext(), EventProgress, downloader.ProgressEvent{ID: item.id, Progress: progress})
	a.emitQueue()
}

func (a *App) emitQueue() {
	a.mu.Lock()
	items := make([]downloader.QueueItem, 0, len(a.order))
	for _, id := range a.order {
		if item := a.tasks[id]; item != nil {
			items = append(items, downloader.QueueItem{ID: item.id, URL: item.options.URL, Progress: item.progress, Error: item.errMessage})
		}
	}
	a.mu.Unlock()
	runtime.EventsEmit(a.eventContext(), EventQueue, items)
}

func (a *App) eventContext() context.Context {
	a.mu.Lock()
	ctx := a.ctx
	a.mu.Unlock()
	if ctx == nil {
		return context.Background()
	}
	return ctx
}

func newID() (string, error) {
	bytes := make([]byte, 12)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
