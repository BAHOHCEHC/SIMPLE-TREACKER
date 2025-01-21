export interface User {
  email: string;
  password: string;
  role: string;
  nickName: string;
  imageSrc?: string;
  token?: string;
  id?: string;
}
export interface Client {
  name: string;
  user?: string;
  tarif?: number;
  totalHours?: number;
  totalPayment?: number;
  archivedTime?: number;
  taskList?: Task[];
  currency?: string;
  id?: string;
}

export interface TaskDay {
  totalDayHour?: number;
  taskDayDate?: string;
  fixDate?: string;
  tasksInDay: Task[] | [];
}
export interface Task {
  name: string;
  cost?: number;
  clientName?: string;
  startTime?: Date;
  endTime?: Date;
  startDay?: any;
  wastedTime?: number;
  totalMoney?: number;
  user?: string;
  formatTime?: string;
  id?: string;
}
export interface Message {
  message: string;
}
