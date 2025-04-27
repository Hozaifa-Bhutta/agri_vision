export { default as UserProfileWidget } from './UserProfileWidget';
export { default as ClimateWidget } from './ClimateWidget';
export { default as YieldsWidget } from './YieldsWidget';
export { default as AuditLogWidget } from './AuditLogWidget';
export { default as AboutWidget } from './AboutWidget';
export { default as NewsWidget } from './NewsWidget';

export interface AuditLogEntry {
  action_type: string;
  action_timestamp: string;
  crop_type: string;
  measurement_date: string;
  county_state: string;
  username: string;
  yieldacre: number | null;
} 