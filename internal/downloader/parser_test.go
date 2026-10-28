package downloader

import (
	"math"
	"testing"
)

func near(a, b, tol float64) bool { return math.Abs(a-b) <= tol }

func feedAll(p *Parser, lines ...string) Progress {
	var last Progress
	for _, l := range lines {
		if pr, ok := p.Feed(l); ok {
			last = pr
		}
	}
	return last
}

func TestParseNum(t *testing.T) {
	tests := []struct {
		in   string
		want float64
		ok   bool
	}{
		{"7111307", 7111307, true},
		{"0.2340671428725078", 0.2340671428725078, true},
		{"8544.0", 8544, true},
		{"NA", 0, false},
		{"None", 0, false},
		{"", 0, false},
		{"abc", 0, false},
	}
	for _, tc := range tests {
		got, ok := parseNum(tc.in)
		if ok != tc.ok || got != tc.want {
			t.Errorf("parseNum(%q) = (%v, %v), want (%v, %v)", tc.in, got, ok, tc.want, tc.ok)
		}
	}
}

func TestEstimateOnlyIsIndeterminate(t *testing.T) {
	p := NewParser()
	got := feedAll(p, "PROGRESS|downloading|712|NA|712|1060.77|NA|NA|NA")

	if !got.Indeterminate {
		t.Error("estimasi tanpa info fragmen harus indeterminate")
	}
	if got.StagePercent != 0 {
		t.Errorf("StagePercent = %v, want 0, bukan 100 palsu", got.StagePercent)
	}
	if !got.Estimated || got.TotalBytes != 712 {
		t.Errorf("Estimated=%v TotalBytes=%d, want true/712", got.Estimated, got.TotalBytes)
	}
}

func TestFragmentProgress(t *testing.T) {
	p := NewParser()
	steps := []struct {
		line string
		want float64
	}{
		{"PROGRESS|downloading|712|NA|712|1060.77|NA|0|6", 0},
		{"PROGRESS|downloading|927310|NA|1571928.0|722995.09|NA|1|6", 0},
		{"PROGRESS|downloading|1618119|NA|2901148.0|1570125.39|NA|2|6", 16.67},
		{"PROGRESS|downloading|4583634|NA|4608957.6|2271779.66|NA|4|6", 50},
		{"PROGRESS|downloading|6262889|NA|7942144.0|2516332.96|NA|6|6", 83.33},
		{"PROGRESS|downloading|7111307|NA|7111307|2577637.88|NA|7|6", 100},
	}
	prev := -1.0
	for _, s := range steps {
		got := feedAll(p, s.line)
		if got.Indeterminate {
			t.Errorf("%q tidak boleh indeterminate", s.line)
		}
		if !near(got.StagePercent, s.want, 0.1) {
			t.Errorf("%q: StagePercent = %v, want ~%v", s.line, got.StagePercent, s.want)
		}
		if got.StagePercent < prev {
			t.Errorf("persentase turun: %v -> %v", prev, got.StagePercent)
		}
		prev = got.StagePercent
	}
}

func TestExactTotalAndIntegerETA(t *testing.T) {
	p := NewParser()
	got := feedAll(p, "PROGRESS|downloading|1024|500884|NA|144514.37738896365|3|NA|NA")

	if got.Estimated || got.TotalBytes != 500884 {
		t.Errorf("Estimated=%v TotalBytes=%d, want false/500884", got.Estimated, got.TotalBytes)
	}
	if got.ETA != 3 {
		t.Errorf("ETA = %d, want 3", got.ETA)
	}
}

func TestTwoStagesOverallPercent(t *testing.T) {
	p := NewParser()

	got := feedAll(p,
		"[info] qTKmh-yXGTM: Downloading 1 format(s): 616+251",
		"[download] Destination: /tmp/x.f616.mp4",
		"PROGRESS|finished|7111307|7111307|NA|2607429.97|NA|NA|NA",
	)
	if got.StageCount != 2 || got.Stage != 1 || !near(got.Percent, 50, 0.01) {
		t.Errorf("setelah tahap 1: %+v", got)
	}

	got = feedAll(p, "[download] Destination: /tmp/x.f251.webm")
	if got.Stage != 2 || !near(got.Percent, 50, 0.01) || got.StagePercent != 0 {
		t.Errorf("awal tahap 2 harus mulai dari 50%% overall, bukan mundur: %+v", got)
	}

	got = feedAll(p, "PROGRESS|downloading|261120|500884|NA|4635523.77|0|NA|NA")
	if !near(got.Percent, 76.07, 0.1) {
		t.Errorf("Percent = %v, want ~76.07", got.Percent)
	}
}

func TestPostProcessing(t *testing.T) {
	p := NewParser()
	got := feedAll(p, `[Merger] Merging formats into "/tmp/x.webm"`)

	if got.Phase != StatusProcessing || got.Percent != 100 {
		t.Errorf("got %+v, want phase=processing percent=100", got)
	}
}

func TestIgnoredLines(t *testing.T) {
	p := NewParser()
	lines := []string{
		"[youtube] qTKmh-yXGTM: Downloading webpage",
		"[hlsnative] Total fragments: 6",
		"Deleting original file /tmp/x.f251.webm (pass -k to keep)",
		"PROGRESS|downloading|1|2",
		"PROGRESS|downloading|1|2|3|4|5",
		"PROGRESS|error|1|2|3|4|5|6|7",
		"",
	}
	for _, l := range lines {
		if _, ok := p.Feed(l); ok {
			t.Errorf("baris %q seharusnya diabaikan", l)
		}
	}
}
