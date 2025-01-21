import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, Message } from '../interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  constructor(private http: HttpClient) { }

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>('http://localhost:5000/api/clients');
  }

  getByName(name: string | undefined): Observable<Client> {
    return this.http.get<Client>(`http://localhost:5000/api/clients/${name}`);
  }

  create(client: Client): Observable<Client> {
    return this.http.post<Client>('http://localhost:5000/api/clients', client);
  }

  update(
    id: string | undefined,
    totalHours: number,
    totalPayment: number
  ): Observable<Client> {
    const formData = {
      totalHours,
      totalPayment
    };
    return this.http.patch<Client>(`http://localhost:5000/api/clients/${id}`, formData);
  }

  delete(id: string): Observable<Message> {
    return this.http.delete<Message>(`http://localhost:5000/api/clients/${id}`);
  }
}
