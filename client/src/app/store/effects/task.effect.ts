import { Task } from './../../shared/interfaces';
import { TasksActionTypes, GettingAllTasks } from './../actions/tasks.action';
import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { TasksService } from '../../shared/services';


@Injectable()
export class TaskEffects {


    constructor(
        private actions$: Actions,
        private tasksService: TasksService
    ) { }

    // @Effect() loadTasks = this.actions$.pipe(
    //     ofType(TasksActionTypes.GET_ALL_TASKS),
    //     switchMap((action: GettingAllTasks) => {
    //         return this.tasksService.getAllClientTask().pipe(
    //             map(task =>
    //                 new GettingAllTasks(task))
    //         )
    //     }),
    //     mergeMap((tasks: Task[]) => {
    //         return [
    //             {
    //                 type: TasksActionTypes.GET_ALL_TASKS,
    //                 payload: tasks
    //             }
    //         ];
    //     })
    // )
}
function Effect(): (target: TaskEffects, propertyKey: "loadTasks") => void {
  throw new Error('Function not implemented.');
}

