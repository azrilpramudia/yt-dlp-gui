package downloader

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"io"
	"os"
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
	if o.AudioOnly {
		format := o.AudioFormat
		if format == "" {
			format = "mp3"
		}
		args = append(args, "-x", "--audio-format", format)
	} else if o.Format != "" {
		args = append(args, "-f", o.Format)
	}

	args = append(args, "--", o.URL)
	return args
}

func (r *Runner) Run(ctx context.Context, o Options, onLine func(stream, line string)) error {
	return r.RunWithProcess(ctx, o, onLine, nil)
}

func (r *Runner) RunWithProcess(ctx context.Context, o Options, onLine func(stream, line string), onProcess func(*os.Process)) error {
	cmd := exec.CommandContext(ctx, r.YtDlpPath, r.buildArgs(o)...)
	configureProcess(cmd)
	cmd.Cancel = func() error {
		if cmd.Process == nil {
			return os.ErrProcessDone
		}
		return terminateProcess(cmd.Process)
	}

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
	if onProcess != nil {
		onProcess(cmd.Process)
	}

	var mu sync.Mutex
	emit := func(stream, line string) {
		mu.Lock()
		defer mu.Unlock()
		onLine(stream, line)
	}

	errCh := make(chan error, 2)
	var wg sync.WaitGroup
	wg.Add(2)
	go func() { defer wg.Done(); errCh <- scan(stdout, "stdout", emit) }()
	go func() { defer wg.Done(); errCh <- scan(stderr, "stderr", emit) }()

	wg.Wait()
	close(errCh)
	var scanErr error
	for err := range errCh {
		scanErr = errors.Join(scanErr, err)
	}
	if err := cmd.Wait(); err != nil {
		return errors.Join(scanErr, err)
	}
	if scanErr != nil {
		return fmt.Errorf("read yt-dlp output: %w", scanErr)
	}
	return nil
}

func scan(rd io.Reader, stream string, emit func(stream, line string)) error {
	sc := bufio.NewScanner(rd)
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for sc.Scan() {
		emit(stream, sc.Text())
	}
	if err := sc.Err(); err != nil {
		_, _ = io.Copy(io.Discard, rd)
		return err
	}
	return nil
}
