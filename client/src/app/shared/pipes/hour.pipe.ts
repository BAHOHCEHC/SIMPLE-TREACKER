import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hourPipe',
  standalone: true,
})
@Injectable({
  providedIn: 'root', // Делает пайп доступным в DI
})
export class HourPipe implements PipeTransform {
  transform(time: number | 0) {
    if (!time) { return 0; }
    let minutes: any = time % 60;
    const hours = (time - minutes) / 60;
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }

    return `${hours}:${minutes}`;
  }
}
