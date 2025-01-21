import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, Task } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  constructor(private http: HttpClient) {}

  fetch(clientsName: string | undefined): Observable<Task[]> {
    return this.http.get<Task[]>(`http://localhost:5000/api/tasks/${clientsName}`);
  }

  getAllClientTask(): Observable<Task[]> {
    return this.http.get<Task[]>(`http://localhost:5000/api/tasks/getAll`);
  }

  create(task: Task): Observable<Task> {
    return this.http.post<Task>('http://localhost:5000/api/tasks/', task);
  }

  update(task: Task): Observable<Task> {
    return this.http.patch<Task>(`http://localhost:5000/api/tasks/${task.id}`, task);
  }

  delete(task: Task): Observable<Message> {
    return this.http.delete<Message>(`http://localhost:5000/api/tasks/${task.id}`);
  }
}
