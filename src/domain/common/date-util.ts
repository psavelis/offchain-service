export const SERVER_TIMEZONE = 'UTC';
export const AUDIENCE_TIMEZONE = 'America/Sao_Paulo';
export const REGION_TIMEZONE = 'America/New_York';
import {DateTime} from 'luxon';

export const getCurrentDateString = (disconnected: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'long',
  }).format(new Date(disconnected.getTime() - 1000 * 60 * 60 * 3));
};

export const getCurrentISOStringDate = (tz: string): string => {
  const timeInBrasilia = DateTime.now().setZone(tz);

  const iso8601 = timeInBrasilia.toFormat("yyyy-MM-dd'T'HH:mm:ss") + 'Z';

  return iso8601;
};

export function getDowntime(disconnected: Date) {
  const downtime = new Date().getTime() - disconnected.getTime();
  const format = downtime > 1000 ? `${downtime / 1000}s` : `${downtime}ms`;
  return format;
}
