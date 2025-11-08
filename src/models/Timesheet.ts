export interface TimesheetEntry {
  id?: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  workDescription: string;
  hoursWorked: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimesheetFormData {
  date: Date;
  workDescription: string;
  hoursWorked: number;
}

export interface MonthlyTimesheetSummary {
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  totalHours: number;
  entries: TimesheetEntry[];
}

export interface DayEntry {
  date: Date;
  hasEntry: boolean;
  entry?: TimesheetEntry;
}
