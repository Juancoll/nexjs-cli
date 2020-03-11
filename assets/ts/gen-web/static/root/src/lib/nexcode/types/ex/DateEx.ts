export class DateEx {

    // [ CONVERTERS ]
    public static SecondsToHHMM(seconds: number): string {
        const secondsCopy = seconds;
        const h = Math.floor(secondsCopy / 3600);
        const m = Math.floor((secondsCopy - (h * 3600)) / 60);
        const s = secondsCopy - (h * 3600) - (m * 60);

        let str = h < 10 ? '0' + h.toString() : h.toString();
        str += ':' + (m < 10 ? '0' + m.toString() : m.toString());
        return str;
    }
    public static SecondsToMMSS(seconds: number): string {
        const secondsCopy = seconds;
        const h = Math.floor(secondsCopy / 3600);
        const m = Math.floor((secondsCopy - (h * 3600)) / 60);
        const s = secondsCopy - (h * 3600) - (m * 60);

        let str = h < 10 ? '0' + h.toString() : h.toString();
        str = (m < 10 ? '0' + m.toString() : m.toString()) + ':';
        str += (seconds < 10 ? '0' + s.toString() : s.toString());
        return str;
    }
}
