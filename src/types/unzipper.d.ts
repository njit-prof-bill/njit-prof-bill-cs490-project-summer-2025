declare module 'unzipper' {
    export namespace Open {
        function buffer(
            buffer: Buffer
        ): Promise<{
            files: Array<{
                path: string;
                buffer(): Promise<Buffer>;
            }>;
        }>;
    }
}