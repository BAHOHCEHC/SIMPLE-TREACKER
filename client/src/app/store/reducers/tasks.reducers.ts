import { Task } from '../../shared/interfaces';
import { TasksActions, TasksActionTypes } from '../actions/tasks.action';

export interface TasksState {
  allDaysWithTasks: Task[];
}

const initialState: TasksState = {
  allDaysWithTasks: [],
};

// export const tasksReducer: (state: any, action: TasksActions) => TasksState = (
//   state = initialState,
//   action: TasksActions) => {
//   switch (action.type) {
//     case TasksActionTypes.CREATE_TASK:
//       return { ...state, allDaysWithTasks: action.payload };
//     case TasksActionTypes.GET_ALL_TASKS:
//       return { ...state, allDaysWithTasks: action.payload };
//     // case TasksActionTypes.CURRENT_CLIENT_TASKS:
//     //     return { ...state, currentClientTasks: action.payload };
//     case TasksActionTypes.UPDATE_TASK:
//       return { ...state, allDaysWithTasks: action.payload };
//     case TasksActionTypes.REMOVE_TASK:
//       return { ...state, allDaysWithTasks: null };
//     default: return state;
//   }
// };


export function tasksReducer(state: any = initialState, action: TasksActions): TasksState {
  switch (action.type) {
    case TasksActionTypes.CREATE_TASK:
      return { ...state, allDaysWithTasks: action.payload };
    case TasksActionTypes.GET_ALL_TASKS:
      return { ...state, allDaysWithTasks: action.payload };
    // case TasksActionTypes.CURRENT_CLIENT_TASKS:
    //     return { ...state, currentClientTasks: action.payload };
    case TasksActionTypes.UPDATE_TASK:
      return { ...state, allDaysWithTasks: action.payload };
    case TasksActionTypes.REMOVE_TASK:
      return { ...state, allDaysWithTasks: null };
    default:
      return state;
  }
}
