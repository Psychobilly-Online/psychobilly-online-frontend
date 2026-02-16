import { parseDate } from '@/lib/date-utils';
import styles from './DateBadge.module.css';

interface DateBadgeProps {
  dateStart: string;
  dateEnd?: string | null;
  size?: 'small' | 'medium' | 'large';
}

export function DateBadge({ dateStart, dateEnd, size = 'medium' }: DateBadgeProps) {
  const eventDate = parseDate(dateStart);
  const endDate = dateEnd ? parseDate(dateEnd) : null;
  
  if (!eventDate) return null;
  
  const isMultiDay = !!endDate && eventDate.getTime() !== endDate.getTime();
  const isDifferentMonth = isMultiDay && endDate && eventDate.getMonth() !== endDate.getMonth();

  const getDay = (date: Date) => date.getDate();
  const getMonth = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const getYear = (date: Date) => date.getFullYear();

  return (
    <div className={`${styles.dateBadge} ${styles[size]}`}>
      {isDifferentMonth ? (
        <>
          <div className={styles.dateMonthRange}>
            <span className={styles.monthStart}>{getMonth(eventDate)}</span>
            <span className={styles.monthSeparator}> </span>
            <span className={styles.monthEnd}>{getMonth(endDate)}</span>
          </div>
          <div className={styles.dateYear}>
            {getYear(eventDate) === getYear(endDate)
              ? getYear(eventDate)
              : `${String(getYear(eventDate)).slice(-2)}/${String(getYear(endDate)).slice(-2)}`}
          </div>
        </>
      ) : isMultiDay && endDate ? (
        <>
          <div className={styles.dateRange}>
            <div className={styles.dateRangeStart}>{getDay(eventDate)}</div>
            <div className={styles.dateRangeSeparator}>-</div>
            <div className={styles.dateRangeEnd}>{getDay(endDate)}</div>
          </div>
          <div className={styles.dateMonth}>{getMonth(eventDate)}</div>
          <div className={styles.dateYear}>
            {getYear(eventDate) === getYear(endDate)
              ? getYear(eventDate)
              : `${String(getYear(eventDate)).slice(-2)}/${String(getYear(endDate)).slice(-2)}`}
          </div>
        </>
      ) : (
        <>
          <div className={styles.dateDay}>{getDay(eventDate)}</div>
          <div className={styles.dateMonth}>{getMonth(eventDate)}</div>
          <div className={styles.dateYear}>{getYear(eventDate)}</div>
        </>
      )}
    </div>
  );
}
