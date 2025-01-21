import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import moment from 'moment';

import { Task, Client } from '../../shared/interfaces';
import { TasksService } from '../../shared/services/tasks.service';
import {
  MaterialDatepicker,
  MaterialService
} from '../../shared/classes/material.service';
import { CommonModule } from '@angular/common';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { HourPipe } from "../../shared/pipes/hour.pipe";
import { Observable } from 'rxjs';

const defaultRate = 20;

@Component({
  selector: 'app-task-row',
  templateUrl: './task-row.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TimepickerModule,
    HourPipe
  ]
})
export class TaskRowComponent implements OnInit, AfterViewInit {
  @Output('updateTasks') taskEmitter = new EventEmitter();

  @Input() taskData!: Task;
  @Input() readonlyParam!: boolean;
  @Input() client!: Client | null;

  @ViewChild('startDay') dayDateStartRef!: ElementRef;

  formTask!: FormGroup;
  submitted = false;
  isEditNow = false;

  form!: FormGroup;


  isNew = true;
  start!: MaterialDatepicker;
  currentTime = moment();
  currentTime2 = moment();

  constructor(private taskService: TasksService, private fb: FormBuilder) { }

  ngOnInit(): void {
    if (this.taskData) {
      this.isNew = false;
    }
    this.initForm();
  }

  ngAfterViewInit(): void {
    if (this.isNew) {
      this.initDatepicker();
      this.setDate();
    }
  }

  private setDate(): void {
    if (this.formTask.controls['name'].untouched) {
      const newTaskName = moment(this.start.date).format('LL') + ` Task`;
      this.formTask.controls['name'].setValue(newTaskName);
    }
    if (this.start.date) {
      this.formTask.controls['startDay'].setValue(moment(this.start.date).format('DD.MM.YYYY'));
    } else {
      this.formTask.controls['startDay'].setValue(new Date());
    }
  }

  deleteTask() {
    this.taskService.delete(this.taskData).subscribe(response => {
      this.taskEmitter.emit();
    });
  }

  onSubmit(): void {
    this.submitted = true;

    const start = moment(this.formTask.value.timeStart);
    const endTime = moment(this.formTask.value.timeEnd);
    const betweenDifferenceM = endTime.diff(start, 'minutes');
    const betweenDifferenceH = Math.floor(betweenDifferenceM / 60);
    const overMinutes = betweenDifferenceM % 60;
    const formatMinute = overMinutes <= 9 ? '0' + overMinutes : overMinutes.toString();
    const wasteTime = Math.abs(betweenDifferenceM) / 60;
    const formatTime = `${betweenDifferenceH}:${formatMinute}`;
    const totalMoney = this.client?.tarif ? wasteTime * this.client.tarif : wasteTime * defaultRate;

    const createTaskObject = (): Task => ({
      name: this.formTask.controls['name'].value,
      cost: this.client?.tarif,
      clientName: this.client?.name,
      startTime: this.formTask.controls['timeStart'].value,
      endTime: this.formTask.controls['timeEnd'].value,
      wastedTime: betweenDifferenceM,
      totalMoney,
      user: this.client?.user,
      formatTime,
      ...(this.isNew && { startDay: moment(this.formTask.controls['startDay'].value, "DD.MM.YYYY").toDate() }),
      ...(this.taskData?.id && { id: this.taskData.id })
    });

    const task = createTaskObject();

    const action$: Observable<Task> = this.isNew
      ? this.taskService.create(task)
      : this.taskService.update(task);

    action$.subscribe((response: Task) => {
      if (this.isNew) {
        this.formTask.reset();
        this.resetForm();
        this.setDate();
        this.formTask.controls['timeEnd'].setValue(moment().add(1, 'minute').toDate());
      } else {
        this.isEditNow = true;
      }
    });

    this.formTask.reset();
    this.taskEmitter.emit();
    this.submitted = false;
  }

  timeLessError() {
    const start = moment(this.formTask.value.timeStart);
    const endTime = moment(this.formTask.value.timeEnd);
    const betweenDifferenceM = endTime.diff(start, 'minutes');
    const betweenDifferenceH = endTime.diff(start, 'hours');
    return ((betweenDifferenceM <= 0) || (betweenDifferenceH < 0));
  }


  private initDatepicker(): void {
    this.start = MaterialService.initDatepicker(
      this.dayDateStartRef,
      this.setDate.bind(this)
    );
    this.start.date = new Date();
  }

  private resetForm(): void {
    this.submitted = false;
    this.formTask.controls['name'].setValue(moment().format('LL') + ` Task`);
    this.formTask.controls['timeStart'].setValue(new Date());
    this.formTask.controls['timeEnd'].setValue(new Date());
    this.formTask.controls['startDay'].setValue(new Date());
  }

  private initForm(): void {
    let initName = moment().format('LL') + ` Task`;
    let initTimeStart = new Date();
    let initTimeEnd = new Date();
    let initStartDay = new Date().toISOString();

    if (this.taskData) {
      initName = this.taskData.name;
      initStartDay = this.taskData.startDay ? this.taskData.startDay : new Date().toISOString();

      const startDay = moment(initStartDay);

      initTimeStart = this.taskData.startTime
        ? moment(this.taskData.startTime)
          .set({
            year: startDay.year(),
            month: startDay.month(),
            date: startDay.date(),
          })
          .toDate()
        : new Date();

      initTimeEnd = this.taskData.endTime
        ? moment(this.taskData.endTime)
          .set({
            year: startDay.year(),
            month: startDay.month(),
            date: startDay.date(),
          })
          .toDate()
        : new Date();
    }

    this.formTask = this.fb.group({
      name: new FormControl(initName, [Validators.required]),
      timeStart: new FormControl(initTimeStart, Validators.required),
      timeEnd: new FormControl(initTimeEnd, [Validators.required]),
      startDay: new FormControl(initStartDay, Validators.required),
    });
  }


  changed() {
    this.isEditNow = true;
  }
}
