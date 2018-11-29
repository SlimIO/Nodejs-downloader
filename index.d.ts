/// <reference types="@types/node" />

declare namespace Downloader {
    interface Release {
        version: string;
        date: Date;
        files: Set<String>;
        npm: string;
        v8: string;
        uv: string;
        zlib: string;
        openssl: string;
        modules: number;
        lts: boolean;
    }

    interface DownloadOptions {
        dest?: string;
        version?: string;
    }

    interface NodeFile {
        Headers: "-headers.tar.gz",
        AixPPC64: "-aix-ppc64.tar.gz",
        Darwin64: "-darwin-x64.tar.gz",
        Arm64: "-linux-arm64.tar.gz",
        Armv6l: "-linux-armv6l.tar.gz",
        Armv7l: "-linux-armv7l.tar.gz",
        PPC64le: "-linux-ppc64le.tar.gz",
        S390x: "-linux-s390x.tar.gz",
        Linux64: "-linux-x64.tar.gz",
        SunOS64: "-sunos-x64.tar.gz",
        WinBinary64: "-win-x64.zip",
        WinBinary86: "-win-x86.zip",
        WinExe64: "-x64.msi",
        WinExe86: "-x86.msi"
    }

    export function getNodeRelease(version: string): Promise<Release>;
    export function downloadNodeFile(file: keyof NodeFile, options?: DownloadOptions): Promise<string>;
    export function extract(file: string): Promise<string>;

    export namespace constants {
        export const File: NodeFile;
    }
}

export as namespace Downloader;
export = Downloader;
