import {
  createWebTaskRepository,
  TaskStorage,
} from '../data/taskRepository.web';

class MemoryStorage implements TaskStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe('web task repository', () => {
  test('persists the complete CRUD lifecycle', async () => {
    const storage = new MemoryStorage();
    const repository = createWebTaskRepository(storage);

    const created = await repository.create({
      title: '  Build TaskMate  ',
      description: '  Persist the task list  ',
      dueDate: '2026-10-20',
      dueTime: '10:15',
      priority: 'medium',
    });
    expect(created.title).toBe('Build TaskMate');
    expect(await repository.list()).toEqual([created]);

    const updated = await repository.update(created.id, {
      title: 'Finish TaskMate',
      description: 'Ready for demonstration',
      dueDate: '2026-10-21',
      dueTime: '11:45',
      priority: 'high',
    });
    expect(updated.title).toBe('Finish TaskMate');

    const completed = await repository.setCompleted(created.id, true);
    expect(completed.completed).toBe(true);

    const reloadedRepository = createWebTaskRepository(storage);
    expect(await reloadedRepository.list()).toEqual([completed]);

    await reloadedRepository.remove(created.id);
    expect(await reloadedRepository.list()).toEqual([]);
  });

  test('reports damaged persisted data instead of silently deleting it', async () => {
    const storage = new MemoryStorage();
    storage.setItem('taskmate.tasks.v1', '{not valid json');

    await expect(createWebTaskRepository(storage).list()).rejects.toThrow();
    expect(storage.getItem('taskmate.tasks.v1')).toBe('{not valid json');
  });

  test('rejects updates for missing tasks', async () => {
    const repository = createWebTaskRepository(new MemoryStorage());

    await expect(
      repository.update('missing', {
        title: 'Unavailable',
        description: '',
        dueDate: null,
        dueTime: null,
        priority: 'none',
      }),
    ).rejects.toThrow('That task no longer exists');
  });

  test('migrates version-one tasks without losing existing content', async () => {
    const storage = new MemoryStorage();
    storage.setItem(
      'taskmate.tasks.v1',
      JSON.stringify({
        version: 1,
        tasks: [
          {
            id: 'legacy-task',
            title: 'Keep my task',
            description: 'Stored before priorities existed',
            completed: false,
            createdAt: '2026-10-10T08:00:00.000Z',
          },
        ],
      }),
    );

    await expect(createWebTaskRepository(storage).list()).resolves.toEqual([
      {
        id: 'legacy-task',
        title: 'Keep my task',
        description: 'Stored before priorities existed',
        completed: false,
        dueDate: null,
        dueTime: null,
        priority: 'none',
        createdAt: '2026-10-10T08:00:00.000Z',
      },
    ]);
    expect(storage.getItem('taskmate.tasks.v3')).toContain('"version":3');
  });
});
