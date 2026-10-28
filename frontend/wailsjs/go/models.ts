export namespace app {

	export class EngineStatus {
	    ffmpegConnected: boolean;
	    ffmpegVersion: string;
	    ytDlpConnected: boolean;
	    ytDlpVersion: string;

	    static createFrom(source: any = {}) {
	        return new EngineStatus(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ffmpegConnected = source["ffmpegConnected"];
	        this.ffmpegVersion = source["ffmpegVersion"];
	        this.ytDlpConnected = source["ytDlpConnected"];
	        this.ytDlpVersion = source["ytDlpVersion"];
	    }
	}

}

export namespace config {

	export class Settings {
	    outputDir: string;
	    outputTemplate: string;
	    ytDlpPath: string;
	    maxConcurrent: number;

	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.outputDir = source["outputDir"];
	        this.outputTemplate = source["outputTemplate"];
	        this.ytDlpPath = source["ytDlpPath"];
	        this.maxConcurrent = source["maxConcurrent"];
	    }
	}

}

export namespace downloader {

	export class Options {
	    url: string;
	    outputDir: string;
	    outputTemplate: string;
	    format: string;
	    audioOnly: boolean;
	    audioFormat: string;

	    static createFrom(source: any = {}) {
	        return new Options(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.url = source["url"];
	        this.outputDir = source["outputDir"];
	        this.outputTemplate = source["outputTemplate"];
	        this.format = source["format"];
	        this.audioOnly = source["audioOnly"];
	        this.audioFormat = source["audioFormat"];
	    }
	}

}

export namespace updater {

	export class UpdateInfo {
	    currentVersion: string;
	    latestVersion: string;
	    releaseUrl: string;
	    available: boolean;

	    static createFrom(source: any = {}) {
	        return new UpdateInfo(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.currentVersion = source["currentVersion"];
	        this.latestVersion = source["latestVersion"];
	        this.releaseUrl = source["releaseUrl"];
	        this.available = source["available"];
	    }
	}

}

