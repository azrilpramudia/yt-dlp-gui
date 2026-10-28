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

Releases are built and published by CircleCI when a version tag beginning with `v` is pushed. The workflow builds Linux amd64, a Windows amd64 NSIS installer, and a universal macOS app archive, then attaches the artifacts to a GitHub Release.

### CircleCI setup

Add a CircleCI project environment variable named `GH_TOKEN`. Its GitHub token must have access to this repository with **Contents: Read and write** permission so CircleCI can create releases and upload assets. Keep the token in CircleCI; do not commit it to the repository.

### Create a release

Push the commit you want to release before creating its tag. Use a tag with a hyphen for a pre-release (for example, `v0.1.1-beta.6`); tags without a hyphen (for example, `v0.1.1`) create a stable release.

```sh
# Pre-release
git tag v0.1.1-beta.6
git push origin v0.1.1-beta.6

# Stable release (use this instead of the pre-release commands)
git tag v0.1.1
git push origin v0.1.1
```

Use a new, unused version tag for every release. CircleCI runs the build jobs for the tag and publishes the GitHub Release only after the Linux, Windows, and macOS jobs all succeed. A tag containing a hyphen is published as a pre-release.

The app checks the latest stable GitHub release on startup and can be checked again from the UI. When a newer release exists, **Open release** takes the user to its release page so they can choose and install the matching package. The app does not replace its own executable.

macOS packages and Windows installers are not code-signed or notarized by this workflow. Users may see operating-system warnings until signing credentials and notarization are configured.
