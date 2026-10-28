package downloader

import (
	"math"
	"regexp"
	"strconv"
	"strings"
)

const progressPrefix = "PROGRESS|"

var formatsRe = regexp.MustCompile(`^\[info\] .+: Downloading \d+ format\(s\): (\S+)`)

var postProcessPrefixes = []string{
	"[Merger]", "[ExtractAudio]", "[VideoConvertor]", "[VideoRemuxer]", "[Fixup",
}

type Parser struct {
	stage       int
	stageCount  int
	maxStagePct float64
	last        Progress
}

func NewParser() *Parser {
	return &Parser{last: Progress{ETA: -1}}
}

func (p *Parser) Feed(line string) (Progress, bool) {
	switch {
	case strings.HasPrefix(line, progressPrefix):
		return p.feedProgress(line)

	case strings.HasPrefix(line, "[download] Destination:"):
		p.stage++
		p.maxStagePct = 0
		p.last = Progress{
			Phase:      StatusDownloading,
			Stage:      p.stage,
			StageCount: p.stageCount,
			Percent:    p.overall(0),
			ETA:        -1,
		}
		return p.last, true

	case strings.HasPrefix(line, "[info] "):
		if m := formatsRe.FindStringSubmatch(line); m != nil {
			p.stageCount = strings.Count(m[1], "+") + 1
			p.stage = 0
			p.maxStagePct = 0
			p.last = Progress{StageCount: p.stageCount, ETA: -1}
		}
		return Progress{}, false
	}

	for _, prefix := range postProcessPrefixes {
		if strings.HasPrefix(line, prefix) {
			p.last.Phase = StatusProcessing
			p.last.StagePercent = 100
			p.last.Percent = 100
			p.last.Speed = 0
			p.last.ETA = -1
			return p.last, true
		}
	}
	return Progress{}, false
}

func (p *Parser) feedProgress(line string) (Progress, bool) {
	f := strings.Split(line, "|")
	if len(f) != 9 || (f[1] != "downloading" && f[1] != "finished") {
		return Progress{}, false
	}

	downloaded, _ := parseNum(f[2])
	total, okTotal := parseNum(f[3])
	estimate, okEst := parseNum(f[4])
	speed, _ := parseNum(f[5])
	eta, okEta := parseNum(f[6])
	fragIdx, _ := parseNum(f[7])
	fragCnt, okCnt := parseNum(f[8])

	var totalBytes float64
	estimated := false
	switch {
	case okTotal && total > 0:
		totalBytes = total
	case okEst && estimate > 0:
		totalBytes = estimate
		estimated = true
	}

	var pct float64
	indeterminate := false
	switch {
	case f[1] == "finished":
		pct = 100
	case okTotal && total > 0:
		pct = downloaded / total * 100
	case okCnt && fragCnt > 0:
		pct = math.Max(fragIdx-1, 0) / fragCnt * 100
	default:
		indeterminate = true
		pct = p.maxStagePct
	}
	pct = math.Min(pct, 100)

	p.maxStagePct = math.Max(p.maxStagePct, pct)
	pct = p.maxStagePct

	etaSec := -1
	if okEta {
		etaSec = int(math.Round(eta))
	}

	p.last = Progress{
		Phase:           StatusDownloading,
		Stage:           p.stage,
		StageCount:      p.stageCount,
		DownloadedBytes: int64(downloaded),
		TotalBytes:      int64(totalBytes),
		Estimated:       estimated,
		Indeterminate:   indeterminate,
		StagePercent:    pct,
		Percent:         p.overall(pct),
		Speed:           speed,
		ETA:             etaSec,
	}
	return p.last, true
}

func (p *Parser) overall(stagePct float64) float64 {
	if p.stage == 0 || p.stageCount <= 1 {
		return stagePct
	}
	v := (float64(p.stage-1)*100 + stagePct) / float64(p.stageCount)
	return math.Min(v, 100)
}

func parseNum(s string) (float64, bool) {
	s = strings.TrimSpace(s)
	if s == "" || s == "NA" || s == "None" {
		return 0, false
	}
	f, err := strconv.ParseFloat(s, 64)
	if err != nil || math.IsNaN(f) || math.IsInf(f, 0) {
		return 0, false
	}
	return f, true
}
