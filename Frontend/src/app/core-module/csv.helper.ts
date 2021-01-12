import {Helper} from './rest/helper';

/**
 * Helper class to generate comma seperated (csv) data from arrays
 */
export class CsvHelper {
    public static fromArray(header: string[], data: string[][]|any) {
        let csv = header.map((h) => '"' + h + '"').join(';');
        for (const d of data) {
            csv += '\n';
            const i = 0;
            let line: string[] = [];
            if (d instanceof Array) {
                line = d;
            } else {
                for (const h of header) {
                    line.push(d[h]);
                }
            }
            csv += line.map((l) => '"' + (l ? (l + '').replace(/"/g,'""') : '') + '"').join(';');
        }
        return csv;
    }
    public static download(filename: string, header: string[], data: string[][]){
        Helper.downloadContent(filename + '.csv', CsvHelper.fromArray(header, data));
    }
}
