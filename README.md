# yt-dlp GUI

A desktop video downloader built with Wails, React, and yt-dlp.

## Requirements

- Go 1.25 or newer
- Node.js 22 or newer
- Wails v2.17.0
- Linux builds: GTK 3 and WebKit2GTK 4.1 development packages
- Windows installers: NSIS
- macOS builds: Xcode command line tools
- yt-dlp installed on `PATH`, or select its executable in **Settings**
- FFmpeg is required by yt-dlp for merging separate video/audio streams and audio extraction

The application does not bundle yt-dlp or FFmpeg. Set the yt-dlp executable path in **Settings** if it is not available through `PATH`.

## Development

```sh
npm --prefix frontend ci
wails dev -tags webkit2_41
```

## Build

```sh
make build VERSION=0.1.0
make build-linux VERSION=0.1.0
make build-windows VERSION=0.1.0
make build-macos VERSION=0.1.0
```

Builds are placed in `build/bin`. Windows packaging uses NSIS. Linux packages are distributed as a tarball containing the application executable; macOS packages are distributed as `.app` archives.

## Releases and updates

Push a version tag such as `v0.1.0` to run the GitHub Actions release workflow. It builds Linux amd64, Windows amd64, macOS Intel, and macOS Apple Silicon artifacts and publishes them on the GitHub Releases page.

The app checks the latest stable GitHub release on startup and can be checked again from the UI. When a newer release exists, **Open release** takes the user to its release page so they can choose and install the matching package. The app does not replace its own executable.

macOS packages and Windows installers are not code-signed or notarized by this workflow. Users may see operating-system warnings until signing credentials and notarization are configured.
