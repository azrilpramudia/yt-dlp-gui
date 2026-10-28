package updater

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"
)

const latestReleaseURL = "https://api.github.com/repos/azrilpramudia/yt-dlp-gui/releases/latest"

var versionPattern = regexp.MustCompile(`^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$`)

type UpdateInfo struct {
	CurrentVersion string `json:"currentVersion"`
	LatestVersion  string `json:"latestVersion"`
	ReleaseURL     string `json:"releaseUrl"`
	Available      bool   `json:"available"`
}

type release struct {
	TagName string `json:"tag_name"`
	HTMLURL string `json:"html_url"`
	Draft   bool   `json:"draft"`
}

func Check(ctx context.Context, currentVersion string) (UpdateInfo, error) {
	info := UpdateInfo{CurrentVersion: currentVersion}
	requestCtx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()
	request, err := http.NewRequestWithContext(requestCtx, http.MethodGet, latestReleaseURL, nil)
	if err != nil {
		return info, fmt.Errorf("create update request: %w", err)
	}
	request.Header.Set("Accept", "application/vnd.github+json")
	request.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	request.Header.Set("User-Agent", "yt-dlp-gui-update-check")
	response, err := (&http.Client{}).Do(request)
	if err != nil {
		return info, fmt.Errorf("check for updates: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return info, fmt.Errorf("GitHub update check returned %s", response.Status)
	}
	var latest release
	if err := json.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(&latest); err != nil {
		return info, fmt.Errorf("read latest release: %w", err)
	}
	if latest.Draft || latest.TagName == "" || latest.HTMLURL == "" {
		return info, fmt.Errorf("GitHub returned an incomplete release record")
	}
	info.LatestVersion = latest.TagName
	info.ReleaseURL = latest.HTMLURL
	info.Available = isNewer(latest.TagName, currentVersion)
	return info, nil
}

func isNewer(latest, current string) bool {
	latestParts := versionPattern.FindStringSubmatch(strings.TrimSpace(latest))
	currentParts := versionPattern.FindStringSubmatch(strings.TrimSpace(current))
	if latestParts == nil || currentParts == nil {
		return false
	}
	for i := 1; i <= 3; i++ {
		latestNumber, err := strconv.Atoi(latestParts[i])
		if err != nil {
			return false
		}
		currentNumber, err := strconv.Atoi(currentParts[i])
		if err != nil {
			return false
		}
		if latestNumber != currentNumber {
			return latestNumber > currentNumber
		}
	}
	if latestParts[4] == "" && currentParts[4] != "" {
		return true
	}
	return false
}
