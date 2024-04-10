import moment from 'moment';
import { Moment } from 'moment';

// OLE numeric short date format
export class QSDate{
    constructor(
        public date: Moment
    ) {
    }
    /* "Functions are based on a date-time serial number that equals the number of days since December 30, 1899. 
    The integer value represents the day and the fractional value represents the time of the day." */
    getIntegerValue(): number {
        const start = moment().year(1899).month(11).date(29);
        return this.date.diff(start, 'days');
    }

    static getMoment(integerValue: number): Moment {
        const start = moment().year(1899).month(11).date(29);
        return start.add(integerValue, 'days');
    }
}