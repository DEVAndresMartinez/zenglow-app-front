import { SaleUserInterface } from "./user.interface";

export interface ResponseSchedule {
  scheduleuuid: string;
  user: SaleUserInterface;
  scheduledayofweek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  schedulestarttime: string;
  scheduleendtime: string;
  schedulestatus: 'active' | 'inactive' | 'deleted';
}

export interface ChangeStatusResponseInterface {
  scheduleuuid: string;
  code: string;
  message: string;
}

export interface CreateScheduleInterface {
  useruuid: string;
  scheduledayofweek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  schedulestarttime: string;
  scheduleendtime: string;
}

export interface CloneScheduleInterface {
  scheduleuuid: string;
  useruuid: string;
}

export interface UpdateScheduleInterface {
  scheduledayofweek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  schedulestarttime: string;
  scheduleendtime: string;
}
