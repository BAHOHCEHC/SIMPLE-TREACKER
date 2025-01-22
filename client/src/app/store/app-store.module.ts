import { tasksReducer, TasksState } from './reducers/tasks.reducers';
import { ClientState, clientReducer } from './reducers/client.reducer';
import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
  taskState: TasksState;
  clientState: ClientState;
}

export const reducers: ActionReducerMap<AppState, any> = {
  taskState: tasksReducer,
  clientState: clientReducer,
};
