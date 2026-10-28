//go:build !windows

package downloader

import (
	"os"
	"os/exec"
	"syscall"
)

func configureProcess(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
}

func PauseProcess(process *os.Process) error {
	return syscall.Kill(-process.Pid, syscall.SIGSTOP)
}

func ResumeProcess(process *os.Process) error {
	return syscall.Kill(-process.Pid, syscall.SIGCONT)
}

func terminateProcess(process *os.Process) error {
	return syscall.Kill(-process.Pid, syscall.SIGKILL)
}
