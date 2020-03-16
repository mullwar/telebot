export class TeleBotDevkit {
    private readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    public log(...message: any[]) {
        // const timeStamp = Date.now();
        // eslint-disable-next-line no-console
        // console.log(`[${timeStamp}] <${this.id}>`, ...message);
    }
}
