# Desktop User Guide

This guide explains how to install and use yt-dlp GUI. The app provides a desktop interface for `yt-dlp`; it does not include `yt-dlp` or FFmpeg.

## Requirements

- **yt-dlp** must be installed separately on Windows, macOS, and Linux. Make it available on `PATH`, or select its executable in **Settings**.
- **FFmpeg** must also be installed separately and available on `PATH`. yt-dlp uses it to merge separate audio/video streams and extract audio.
- **Windows only:** Microsoft Edge WebView2 Runtime is required to display the app. It is already present on many systems; if it is missing, the app can offer to download and install it. See the [Wails Windows runtime guide](https://v2.wails.io/docs/guides/windows/).
- **Linux only:** GTK 3 and WebKit2GTK 4.1 runtime libraries must be installed on the system for the desktop app to start. These are app runtime dependencies; they are separate from yt-dlp and FFmpeg.
- **macOS:** the app uses the WebKit framework provided by macOS; no separate GTK or WebKit2GTK installation is needed.
- An internet connection is needed to download media and check for application updates.

The app shows the detected yt-dlp and FFmpeg versions in its bottom status bar. If either shows `—`, check that the tool is installed and available to the app. For yt-dlp, you can also select its executable in Settings.

## Install the app

Download the package for your operating system from the project's GitHub Releases page:

- **Windows:** run the `.exe` installer. The installer is not code-signed, so Windows may show a security prompt.
- **macOS:** open the universal `.zip`, then move `ytdlp-gui.app` to Applications. The app is not notarized; macOS may show a first-open security warning. No separate WebKit installation is required.
- **Linux:** first make sure GTK 3 and WebKit2GTK 4.1 runtime libraries are installed. Then extract the `.tar.gz` archive and run the `ytdlp-gui` executable. Install the matching runtime packages using your Linux distribution's package manager if they are missing.

The release packages do not bundle yt-dlp or FFmpeg. Install both separately before downloading media on any operating system. Linux users must also have GTK 3 and WebKit2GTK 4.1 installed before launching the app.

## Download media

1. Open **Downloads**.
2. Paste a media or playlist URL into **Media / Playlist URL**. Use **Paste** to read the clipboard, or paste with the keyboard.
3. Choose the video quality. The available choices include 1080p, best available, 720p, 480p, and 360p.
4. To save audio only, turn on **Extract Audio** and choose MP3, M4A, Opus, WAV, or FLAC.
5. Choose an output folder with the folder button. The default is the Downloads folder.
6. Select **Analyze** to add the URL to the download queue and start or schedule the download.

The queue shows progress, speed, remaining time, and file size when available. You can **Pause**, **Resume**, or **Cancel** an active download. Pausing is available while a download is running and may depend on operating-system process support.

Use the **Queue** selector to choose sequential downloads or up to four concurrent downloads. The same limit can be changed in **Settings**.

## History

Open **History** to see completed, failed, and cancelled downloads from the current app session. **Clear completed** removes finished entries from the app's queue and history view. Downloaded files remain in their output folder. The activity list is not a persistent download database, so it is cleared when the app closes.

## Settings and appearance

In **Settings**:

- **File name template** controls output names. The default is `%(title)s.%(ext)s`. yt-dlp output template fields can be used, for example `%(uploader)s/%(title)s.%(ext)s`.
- **yt-dlp binary path** can be left as `yt-dlp` when it is on `PATH`, or set to the executable using **Browse…**.
- **Download queue** sets the maximum concurrent downloads from one to four.

Select **Save** to apply downloader settings to new downloads. The app stores these settings in its per-user configuration directory as `ytdlp-gui/settings.json`. The theme button at the bottom of the sidebar switches between dark and light mode; the selection is saved on this device.

## Updates

Open **Updates** and select **Check again** to check GitHub Releases. The app checks for stable releases; beta/pre-release versions are not offered as application updates. When an update is available, select **View release** and download the package for your operating system. Updates are installed manually, and the app does not replace its own executable.

## Troubleshooting

- **yt-dlp not detected:** install yt-dlp, restart the app, or select its executable under **Settings**.
- **FFmpeg not detected or audio/video merge fails:** install FFmpeg and make sure its executable is available on `PATH` to yt-dlp.
- **Download fails:** check the URL and internet connection, and confirm that the site is supported by your installed yt-dlp version. Some sites may require a newer yt-dlp release.
- **Update check fails:** check the internet connection and try again. The update check requires access to GitHub Releases.
- **No sound extraction or merged output:** install FFmpeg; yt-dlp uses it for these operations.
