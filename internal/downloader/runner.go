package downloader

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os/exec"
	"path/filepath"
	"sync"
)

const progressTemplate = "download:PROGRESS|%(progress.status)s|%(progress.downloaded_bytes)s|" +
	"%(progress.total_bytes)s|%(progress.total_bytes_estimate)s|%(progress.speed)s|%(progress.eta)s|" +
	"%(progress.fragment_index)s|%(progress.fragment_count)s"

type Runner struct {
	YtDlpPath string
}

func (r *Runner) buildArgs(o Options) []string {
	tmpl := o.OutputTemplate
	if tmpl == "" {
		tmpl = "%(title)s.%(ext)s"
	}

	args := []string{
		"--newline",
		"--no-playlist",
		"--progress-template", progressTemplate,
		"-o", filepath.Join(o.OutputDir, tmpl),
	}
	if o.Format != "" {
		args = append(args, "-f", o.Format)
	}

	args = append(args, "--", o.URL)
	return args
}

func (r *Runner) Run(ctx context.Context, o Options, onLine func(stream, line string)) error {
	cmd := exec.CommandContext(ctx, r.YtDlpPath, r.buildArgs(o)...)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("stdout pipe: %w", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start yt-dlp: %w", err)
	}

	var mu sync.Mutex
	emit := func(stream, line string) {
		mu.Lock()
		defer mu.Unlock()
		onLine(stream, line)
	}

	var wg sync.WaitGroup
	wg.Add(2)
	go func() { defer wg.Done(); scan(stdout, "stdout", emit) }()
	go func() { defer wg.Done(); scan(stderr, "stderr", emit) }()

	wg.Wait()
	return cmd.Wait()
}

func scan(rd io.Reader, stream string, emit func(stream, line string)) {
	sc := bufio.NewScanner(rd)
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for sc.Scan() {
		emit(stream, sc.Text())
	}
}
