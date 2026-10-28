.PHONY: dev build build-linux build-windows build-macos

VERSION ?= dev
LDFLAGS = -X main.version=$(VERSION)

dev:
	wails dev -tags webkit2_41

build:
	wails build -tags webkit2_41 -ldflags "$(LDFLAGS)"

build-linux:
	wails build -platform linux/amd64 -tags webkit2_41 -ldflags "$(LDFLAGS)"

build-windows:
	wails build -platform windows/amd64 -tags webkit2_41 -ldflags "$(LDFLAGS)" -nsis

build-macos:
	wails build -platform darwin/universal -ldflags "$(LDFLAGS)"
