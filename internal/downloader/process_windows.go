//go:build windows

package downloader

import (
	"fmt"
	"os"
	"os/exec"
	"syscall"
)

var (
	kernel32           = syscall.NewLazyDLL("kernel32.dll")
	ntdll              = syscall.NewLazyDLL("ntdll.dll")
	openProcess        = kernel32.NewProc("OpenProcess")
	closeHandle        = kernel32.NewProc("CloseHandle")
	ntSuspendProcess   = ntdll.NewProc("NtSuspendProcess")
	ntResumeProcess    = ntdll.NewProc("NtResumeProcess")
	processSuspendFlag = uintptr(0x0800)
)

func configureProcess(_ *exec.Cmd)               {}
func terminateProcess(process *os.Process) error { return process.Kill() }

func withProcess(process *os.Process, call *syscall.LazyProc) error {
	handle, _, openErr := openProcess.Call(processSuspendFlag, 0, uintptr(process.Pid))
	if handle == 0 {
		return fmt.Errorf("open process for pause/resume: %w", openErr)
	}
	defer closeHandle.Call(handle)
	status, _, _ := call.Call(handle)
	if status != 0 {
		return fmt.Errorf("process pause/resume failed with NTSTATUS 0x%x", status)
	}
	return nil
}

func PauseProcess(process *os.Process) error  { return withProcess(process, ntSuspendProcess) }
func ResumeProcess(process *os.Process) error { return withProcess(process, ntResumeProcess) }
