export class StringEx {

    public static replaceAll(str: string, find: string, replace: string) {
        return str.split(find).join(replace);
    }
    public static toList(value: string, separator: string = ','): string[] {
        if (typeof value == 'undefined') { return new Array<string>(); }
        if (value == null) { return new Array<string>(); }

        const split = value.split(separator);
        const values = new Array<string>();
        split.forEach(x => {
            const trimmed = x.trim();
            if (trimmed != '') {
                values.push(trimmed);
            }
        });
        return values;
    }
}
