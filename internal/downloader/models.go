package downloader

import "fmt"

type Status string

const (
	StatusQueued      Status = "queued"
	StatusDownloading Status = "downloading"
	StatusProcessing  Status = "processing"
	StatusFinished    Status = "finished"
	StatusFailed      Status = "failed"
	StatusCancelled   Status = "cancelled"
)

type Options struct {
	URL            string `json:"url"`
	OutputDir      string `json:"outputDir"`
	OutputTemplate string `json:"outputTemplate"`
	Format         string `json:"format"`
	AudioOnly      bool   `json:"audioOnly"`
	AudioFormat    string `json:"audioFormat"`
}

type Progress struct {
	Phase           Status  `json:"phase"`
	Stage           int     `json:"stage"`
	StageCount      int     `json:"stageCount"`
	DownloadedBytes int64   `json:"downloadedBytes"`
	TotalBytes      int64   `json:"totalBytes"`
	Estimated       bool    `json:"estimated"`
	Indeterminate   bool    `json:"indeterminate"`
	StagePercent    float64 `json:"stagePercent"`
	Percent         float64 `json:"percent"`
	Speed           float64 `json:"speed"`
	ETA             int     `json:"eta"`
}

// DownloadError carries a user-facing message reported by yt-dlp or the runner.
type DownloadError struct {
	Message string `json:"message"`
}

func (e *DownloadError) Error() string { return e.Message }

func NewDownloadError(message string) *DownloadError {
	return &DownloadError{Message: message}
}

func WrapDownloadError(err error) *DownloadError {
	return NewDownloadError(fmt.Sprint(err))
}
