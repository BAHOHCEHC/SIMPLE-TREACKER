import moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { reduce, takeUntil, tap } from 'rxjs/operators';

import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Task, Client, TaskDay } from '../../shared/interfaces';
import { TasksService, ClientsService } from '../../shared/services';
import { TaskRowComponent } from "../task-row/task-row.component";

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from "../../shared/components/loader/loader.component";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import jsPDF from 'jspdf';
import { roboroBold, robotoNormal } from '../../../assets/fonts';
import { HourPipe } from '../../shared/pipes/hour.pipe';
import { AppState } from '../../store/app-store.module';
import { Store } from '@ngrx/store';
import { GetCurrentClient } from '../../store/actions/client.action';
import { GettingAllTasks } from '../../store/actions/tasks.action';
import { TasksState } from '../../store/reducers/tasks.reducers';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  imports: [TaskRowComponent, HourPipe, CommonModule, FormsModule, LoaderComponent, BsDatepickerModule],
  providers: [
    { provide: 'Window', useValue: window },
  ]
})
export class TasksComponent implements OnInit, OnDestroy {
  tokenId!: string | null;
  clientName!: string;
  userName: string | null = null;
  allTasks$!: Observable<any[]>;

  destroy$ = new Subject<void>();
  client!: Client;
  tarif = 10;

  statisticParam!: string;
  initialDate = new Date();
  bsRangeValue: Date[] = [];

  totalHours = 0;
  totalPayment = 0;

  hourPipe = inject(HourPipe);
  PDFdataArray: any[] = [];
  currency: string | null = null;
  fromFormat: Date | null = null;
  toFormat: Date | null = null;

  hideInformation = true;

  tasksss$: Observable<Task[]> | undefined;
  flag: boolean | undefined = false;

  constructor(
    private taskService: TasksService,
    private route: ActivatedRoute,
    private clientService: ClientsService,
    private store: Store<TasksState>,
    @Inject('Window') private window: Window,
  ) {
    let initialStart = new Date();
    initialStart.setDate(1);
    initialStart.setMonth(initialStart.getMonth() - 1);
    this.bsRangeValue = [initialStart, this.initialDate];
  }

  ngOnInit(): void {
    this.tasksss$ = this.store.select('allDaysWithTasks');


    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.clientName = params['id'];
        this.clientService
          .getByName(this.clientName)
          .subscribe(client => {
            this.client = client;
            this.store.dispatch(new GetCurrentClient(client));
            this.tarif = client.tarif ? client.tarif : 10;
            this.updateTasksList(undefined);
          });
      });

  }

  // 3) При добавлении задачи добавить функцию чтоб она обновляла страницу (или инициировать нажатие кнопки F5)
  // 4) Рядом с датами добавить чекбокс "Hide Price" чтоб можно было вывести PDF без hour rate и total payment, Total hours поставить вначале, затем hour rate & total payment pdf

  updateTasksList(event: any): void {
    this.allTasks$ = this.taskService.fetch(this.clientName).pipe(
      tap(res => {
        this.totalHours = +res.reduce((acc, cur) => acc + (cur.wastedTime || 0), 0).toFixed(2);
        this.totalPayment = this.totalHours * this.tarif / 60;

        this.clientService.update(this.client.id, this.totalHours / 60, this.totalPayment)
          .subscribe(res => {
            this.flag = true
            this.store.dispatch(new GetCurrentClient(res));
          });
      }),
      reduce((acc: TaskDay[], tasks: Task[]) => {
        tasks.forEach((task: Task) => {
          const fixDate = new Date(task.startDay);
          const date = moment(fixDate).format('dddd, D MMM');
          const exist = acc.find((e: TaskDay) => e.taskDayDate === date);

          if (exist) {
            // @ts-ignore
            exist.tasksInDay.push(task);
            exist.tasksInDay.sort((a, b) => moment(a.endTime).diff(moment(b.endTime)));
            // @ts-ignore
            exist.totalDayMinutes += task.wastedTime || 0;
          } else {
            acc.push({
              taskDayDate: date,
              totalDayMinutes: task.wastedTime || 0,
              tasksInDay: [task],
            });
          }
        });
        return acc;
      }, []),
      tap(res => {
        this.PDFdataArray = res.map(day => ({
          text: day.taskDayDate,
          period: 'Total:',
          time: day.totalDayMinutes,
          // @ts-ignore
          tasks: day.tasksInDay.map((task) => ({
            text: task.name,
            period: `${moment(task.startTime).format('HH:mm')} - ${moment(task.endTime).format('HH:mm')}`,
            time: this.hourPipe.transform(task.wastedTime),
          })),
        }));

        this.store.dispatch(new GettingAllTasks(res));
      })
    );
    if (this.flag && typeof event !== 'object') {
      setTimeout(() => {
        this.flag = false;
        window.location.reload(); // Перезагрузка страницы
      }, 1000)
    }
  }


  goToStatistic(): void {

    if (this.bsRangeValue.length !== 2) {
      console.error('Диапазон дат не задан.');
      return;
    }
    const from = moment(this.bsRangeValue[0]).startOf('day');
    const to = moment(this.bsRangeValue[1]).endOf('day');
    const currentYear = moment().year(); // Текущий год

    // Фильтрация массива PDFdataArray
    const filteredData = this.PDFdataArray.filter((line) => {
      // Преобразование текста в дату и установка текущего года
      const lineDate = moment(line.text, 'dddd, D MMM').year(currentYear);

      // Проверка попадания даты в диапазон
      return lineDate.isBetween(from, to, undefined, '[]'); // [] - включает границы диапазона
    });

    console.log('Отфильтрованные данные:', filteredData);

    // Если нужно обновить массив PDFdataArray
    this.PDFdataArray = filteredData.reverse();


    let startPoint = 20;
    let currentPointY = 90;
    let total: string | null = null;

    const doc = new jsPDF({
      unit: 'px',
    });
    const boldFont = roboroBold; // Load the *.ttf font file as binary string
    const normalFont = robotoNormal; // Load the *.ttf font file as binary string

    doc.addFileToVFS('Roboto-Bold-bold.ttf', boldFont);
    doc.addFont('Roboto-Bold-bold.ttf', 'Roboto', 'bold');
    doc.addFileToVFS('Roboto-Regular-normal.ttf', normalFont);
    doc.addFont('Roboto-Regular-normal.ttf', 'Roboto', 'normal');

    doc.setFontSize(10);
    doc.setFont('Roboto', 'bold');
    doc.text(this.userName || 'Kateryna Hordymova', 20, startPoint);
    doc.setFont('Roboto', 'normal');
    doc.text('UX/UI designer', 595 - (('UX/UI designer'.length * 7) + 40), startPoint);
    startPoint += 20;

    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    doc.text(this.clientName || 'CLIENT NAME', 20, startPoint);
    startPoint += 20;
    doc.setFontSize(10);

    if (!this.hideInformation) {
      doc.setFont('Roboto', 'normal');
      doc.text(`${this.client?.tarif || 0} ${this.currency || ''}$ / hour`, 20, startPoint);
    }

    if (this.hideInformation) {
      doc.text('Total hours:', 20, startPoint);
      doc.setFont('Roboto', 'bold');
      if (typeof this.totalHours === 'number') {
        doc.text(this.hourPipe.transform(this.totalHours) || '', 65, startPoint);
      }
    } else {
      doc.text('Total hours:', 80, startPoint);
      doc.setFont('Roboto', 'bold');
      if (typeof this.totalHours === 'number') {
        doc.text(this.hourPipe.transform(this.totalHours) || '', 125, startPoint);
      }
    }

    if (!this.hideInformation) {
      doc.setFont('Roboto', 'normal');
      doc.text('Total payment:', 190, startPoint);
      doc.setFont('Roboto', 'bold');
      doc.text(`${this.totalPayment?.toString() || '0'} ${this.currency || ''}`, 255, startPoint);
      doc.text('$', 275, startPoint);
    }

    doc.setFont('Roboto', 'normal');
    doc.text('Period:', 320, startPoint);

    doc.setFont('Roboto', 'bold');
    const range = `${moment(from).format('MMM Do')} - ${moment(to).format('MMM Do')}`;
    doc.text(range, 410, startPoint, { align: 'right' });


    this.PDFdataArray.forEach((line, indx) => {
      if (typeof line.time === 'number') {
        doc.setLineWidth(0.5);
        doc.line(20, currentPointY - 10, 420, currentPointY - 10);

        // заголовок дня с тасками
        currentPointY += 10;
        doc.setFontSize(12);
        doc.setFont('Roboto', 'bold');
        doc.text(line.text || '', 20, currentPointY);
        doc.text(line.period || '', 350, currentPointY);
        total = this.hourPipe.transform(line.time).toString();
        doc.text(total || '', 410, currentPointY, { align: 'right' });
        doc.setFont('Roboto', 'normal');

        // таски внутри дня
        line.tasks.forEach((e: { text: any; period: any; time: string | null; }) => {
          currentPointY += 15;
          doc.setFontSize(10);
          doc.setFont('Roboto', 'normal');
          doc.text(e.text || '', 20, currentPointY);
          doc.text(e.period || '', 330, currentPointY);
          total = e.time;
          doc.text(total || '', 410, currentPointY, { align: 'right' });
        });
      }

      // НА ДРУГУЮ СТРАНИЦУ
      if (currentPointY >= 590) {
        doc.addPage();
        currentPointY = 35;
        if (typeof line.time === 'number') {
          doc.setLineWidth(0.5);
          doc.line(20, currentPointY - 10, 420, currentPointY - 10);
          currentPointY += 5;
          doc.setFontSize(12);
          doc.setFont('Roboto', 'bold');
          doc.text(line.text || '', 20, currentPointY);
          doc.text(line.period || '', 330, currentPointY);
          total = this.hourPipe.transform(line.time).toString();
          doc.text(total || '', 410, currentPointY, { align: 'right' });
          doc.setFont('Roboto', 'normal');
        }
      }

      currentPointY += 20;
    });

    doc.save('Test.pdf');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
