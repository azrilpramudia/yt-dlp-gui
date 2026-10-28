package main

import (
	"context"
	"fmt"
	"os"

	"ytdlp-gui/internal/downloader"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("usage: go run ./cmd/dltest <url>")
		os.Exit(1)
	}

	r := &downloader.Runner{YtDlpPath: "./binaries/linux/yt-dlp"}
	p := downloader.NewParser()

	err := r.Run(
		context.Background(),
		downloader.Options{URL: os.Args[1], OutputDir: "/tmp/ytdlp-test"},
		func(stream, line string) {
			if pr, ok := p.Feed(line); ok {
				fmt.Printf("%-11s tahap %d/%d  stage=%5.1f%%  total=%5.1f%%  speed=%8.0f B/s  eta=%ds  est=%v  ind=%v\n",
					pr.Phase, pr.Stage, pr.StageCount, pr.StagePercent, pr.Percent, pr.Speed, pr.ETA, pr.Estimated, pr.Indeterminate)
				return
			}
			fmt.Printf("[%s] %s\n", stream, line)
		},
	)
	fmt.Println("selesai, err =", err)
}
