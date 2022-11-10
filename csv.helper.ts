import {Helper} from './rest/helper';

/**
 * Helper class to generate comma seperated (csv) data from arrays
 */
export class CsvHelper {
    /**
     * if data is an object, the values for each row will be fetched based on the headerInternal list or (if it is not present) the header list
     */
    public static fromArray(header: string[], data: string[][]|any, headerInternal?: string[]) {
        let csv = header.map((h) => '"' + h + '"').join(';');
        for (const d of data) {
            csv += '\n';
            const i = 0;
            let line: string[] = [];
            if (d instanceof Array) {
                line = d;
            } else {
                for (const h of headerInternal || header) {
                    line.push(d[h]);
                }
            }
            csv += line.map((l) => '"' + (l ? (l + '').replace(/"/g,'""') : '') + '"').join(';');
        }
        return csv;
    }
    public static download(filename: string, header: string[], data: string[][], headerInternal: string[] = null){
        Helper.downloadContent(filename + '.csv', CsvHelper.fromArray(header, data, headerInternal));
    }
}
