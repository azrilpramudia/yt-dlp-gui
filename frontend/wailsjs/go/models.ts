export namespace downloader {
	
	export class Options {
	    url: string;
	    outputDir: string;
	    outputTemplate: string;
	    format: string;
	
	    static createFrom(source: any = {}) {
	        return new Options(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.url = source["url"];
	        this.outputDir = source["outputDir"];
	        this.outputTemplate = source["outputTemplate"];
	        this.format = source["format"];
	    }
	}

}

