import { TranslateService } from '@ngx-translate/core/lib/translate.service';
import { RestHelper } from './rest-helper';

const translateServiceMock = {
    instant: (key: string, values?: any) => key + JSON.stringify(values),
} as TranslateService;
describe('testing convert duration', () => {
    it('converting hh:mm:ss', () => {
        expect(RestHelper.getDurationInSeconds(null)).toEqual(0);
        expect(RestHelper.getDurationInSeconds('')).toEqual(0);
        expect(RestHelper.getDurationInSeconds('00:01:00')).toEqual(60);
        expect(RestHelper.getDurationInSeconds('01:01:01')).toEqual(3600 + 60 + 1);
    });
    it('converting mm:ss', () => {
        expect(RestHelper.getDurationInSeconds('00:01')).toEqual(1);
        expect(RestHelper.getDurationInSeconds('01:01')).toEqual(60 + 1);
    });
    it('converting PT', () => {
        expect(RestHelper.getDurationInSeconds('PT1H1M1S')).toEqual(3600 + 60 + 1);
        expect(RestHelper.getDurationInSeconds('PT1M1S')).toEqual(60 + 1);
        expect(RestHelper.getDurationInSeconds('PT1S')).toEqual(1);
    });
});
