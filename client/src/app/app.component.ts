import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Client, User } from './shared/interfaces';
import { ClientsService } from './shared/services';
import { Observable, Subject, tap } from 'rxjs';
import { MaterialInstance, MaterialService } from './shared/classes/material.service';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    LoaderComponent],
  templateUrl: './app.component.html',
  styles: [
    `
    :host {
        display: flex;
    }
    .sidenav {
        background-color: #1f2b39;
    }`
  ]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('modal', { static: false })
  modalRef!: ElementRef;
  @ViewChild('select', { static: false })
  selectRef!: ElementRef;
  @ViewChild('confirm', { static: false })
  confirmRef!: ElementRef;

  private router: Router = inject(Router);
  private clientsService = inject(ClientsService);

  // private store: Store<AppState>,
  form!: FormGroup;

  loading = false;
  deletedClient!: Client;
  user: User | undefined;
  destroy$ = new Subject<void>();

  show = false;
  modal!: MaterialInstance;
  select!: MaterialInstance;
  confirm!: MaterialInstance;
  clientsName: string[] = [];
  message = '';
  clients$: Observable<Client[]> | undefined;

  constructor(private fb: FormBuilder) {
    this.user = {
      email: "Kateakane@gmail.com",
      password: "748159263Rr",
      imageSrc: "profile1.png",
      role: "admin",
      nickName: "Akanemiko"
    }
  }

  ngOnInit(): void {

    this.form = this.fb.group({
      name: ['', [Validators.required]],
      currency: ['', [Validators.required]],
      tarif: [10, [Validators.required, Validators.min(10)]],
    });

    this.getAllClients();
  }

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef);
    this.select = MaterialService.initSelect(this.selectRef);
    this.confirm = MaterialService.initModal(this.confirmRef);
  }

  addNewProject(): void {
    if (this.modal?.open) {
      this.modal.open();
    }
    MaterialService.updateTextInputs();
  }

  chekClientExist(name: string): boolean {
    const mutch = this.clientsName.some(item => {
      return name.toLowerCase().replace(/\s/g, '') === item;
    });
    if (mutch) {
      this.message = 'Такой клиент существует';
      return true;
    } else {
      this.form.enable();
      this.message = '';
      return false;
    }
  }


  private getAllClients(): void {
    this.clients$ = this.clientsService.getAllClients().pipe(
      tap(clients => {
        clients.forEach(client => {
          return this.clientsName.push(client.name.toLowerCase().replace(/\s/g, ''));
        });

      })
    );
  }

  resetForm(): void {
    this.form.reset({
      name: '',
      currency: 'dollar',
      tarif: 10
    });
  }

  closeModal(): void {
    if (this.modal?.close) {
      this.modal.close();
    }
    this.resetForm();
  }

  onSubmit(): void {
    if (!this.form.value.name) {
      return;
    }
    if (this.form.value.name) {
      if (this.chekClientExist(this.form.value.name)) {
        return;
      } else {
        this.form.enable();
      }
    }

    this.form.value.currency = this.selectRef.nativeElement.value;
    this.clientsService.create(this.form.value).subscribe(client => {
      this.router.navigate([`/clients/${client.name}`]);
      this.getAllClients();
    });
    this.closeModal();
    MaterialService.updateTextInputs();
  }

  deleteClient(client: Client): void {
    this.deletedClient = client;
    if (this.confirm?.open) {
      this.confirm.open();
    }
  }

  confirmDelete(): void {
    const deletedClientId = this.deletedClient.name;

    if (deletedClientId) {
      this.clientsService
        .delete(deletedClientId)
        .subscribe(({ message }) => {
          MaterialService.toast(message);
        });

      this.getAllClients();

      const deletedClient = this.router.url.substring('/clients/'.length);

      if (this.deletedClient.name === deletedClient) {
        this.router.navigate(['/clients']);
      }

      if (this.confirm?.close) {
        this.confirm.close();
      }
    }

  }

  cancelDelete(): void {
    if (this.confirm?.close) {
      this.confirm.close();
    }
  }

  ngOnDestroy(): void {
    if (this.modal?.destroy) {
      this.modal.destroy();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
