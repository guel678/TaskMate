import {
  filterTasks,
  getTaskDueState,
  getTaskProgress,
  normalizeTaskInput,
  sortTasksByPriority,
  TaskValidationError,
} from '../domain/tasks';
import { Task } from '../types/task';

const tasks: Task[] = [
  {
    id: 'active',
    title: 'Active task',
    description: '',
    completed: false,
    dueDate: '2026-10-13',
    dueTime: '09:30',
    priority: 'high',
    createdAt: '2026-10-12T08:00:00.000Z',
  },
  {
    id: 'completed',
    title: 'Completed task',
    description: 'Done',
    completed: true,
    dueDate: '2026-10-11',
    dueTime: null,
    priority: 'low',
    createdAt: '2026-10-11T08:00:00.000Z',
  },
];

describe('task domain rules', () => {
  test('normalizes user input before persistence', () => {
    expect(
      normalizeTaskInput({
        title: '  Finish activity  ',
        description: '  Chapter 4  ',
        dueDate: '2026-10-20',
        dueTime: '14:45',
        priority: 'medium',
      }),
    ).toEqual({
      title: 'Finish activity',
      description: 'Chapter 4',
      dueDate: '2026-10-20',
      dueTime: '14:45',
      priority: 'medium',
    });
  });

  test('rejects a blank title', () => {
    expect(() =>
      normalizeTaskInput({
        title: '   ',
        description: '',
        dueDate: null,
        dueTime: null,
        priority: 'none',
      }),
    ).toThrow(TaskValidationError);
  });

  test('filters active and completed tasks without changing the source list', () => {
    expect(filterTasks(tasks, 'active').map((task) => task.id)).toEqual(['active']);
    expect(filterTasks(tasks, 'completed').map((task) => task.id)).toEqual(['completed']);
    expect(filterTasks(tasks, 'all')).toBe(tasks);
  });

  test('calculates completion progress', () => {
    expect(getTaskProgress(tasks)).toEqual({ completed: 1, percentage: 50, total: 2 });
    expect(getTaskProgress([])).toEqual({ completed: 0, percentage: 0, total: 0 });
  });

  test('validates date-only due dates and identifies overdue tasks', () => {
    expect(() =>
      normalizeTaskInput({
        title: 'Invalid date',
        description: '',
        dueDate: '2026-02-30',
        dueTime: '09:00',
        priority: 'none',
      }),
    ).toThrow('Choose a valid due date');

    expect(getTaskDueState(tasks[0], new Date(2026, 9, 14, 12))).toBe('overdue');
    expect(getTaskDueState(tasks[1], new Date(2026, 9, 14, 12))).toBe('none');
  });

  test('requires a valid date before accepting a reminder time', () => {
    expect(() =>
      normalizeTaskInput({
        title: 'Time without date',
        description: '',
        dueDate: null,
        dueTime: '09:00',
        priority: 'low',
      }),
    ).toThrow('Choose a due date');

    expect(() =>
      normalizeTaskInput({
        title: 'Invalid time',
        description: '',
        dueDate: '2026-10-20',
        dueTime: '25:00',
        priority: 'low',
      }),
    ).toThrow('Choose a valid due time');
  });

  test('sorts tasks by priority and then newest first', () => {
    const unsorted: Task[] = [
      { ...tasks[0], id: 'low-new', priority: 'low', createdAt: '2026-10-14T08:00:00.000Z' },
      { ...tasks[0], id: 'none', priority: 'none', createdAt: '2026-10-15T08:00:00.000Z' },
      { ...tasks[0], id: 'high-old', priority: 'high', createdAt: '2026-10-10T08:00:00.000Z' },
      { ...tasks[0], id: 'medium', priority: 'medium', createdAt: '2026-10-16T08:00:00.000Z' },
      { ...tasks[0], id: 'high-new', priority: 'high', createdAt: '2026-10-12T08:00:00.000Z' },
    ];

    expect(sortTasksByPriority(unsorted).map((task) => task.id)).toEqual([
      'high-new',
      'high-old',
      'medium',
      'low-new',
      'none',
    ]);
  });
});
