import * as SQLite from 'expo-sqlite';

import {
  createTaskEntity,
  isTaskPriority,
  normalizeTaskInput,
} from '../domain/tasks';
import { Task, TaskInput } from '../types/task';
import {
  repositoryError,
  TaskRepository,
  TaskRepositoryError,
} from './taskRepository.types';

type TaskRow = {
  id: string;
  title: string;
  description: string;
  completed: number;
  due_date: string | null;
  due_time: string | null;
  priority: string;
  created_at: string;
};

const DATABASE_NAME = 'taskmate.db';
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function mapRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed === 1,
    dueDate: row.due_date,
    dueTime: row.due_time,
    priority: isTaskPriority(row.priority) ? row.priority : 'none',
    createdAt: row.created_at,
  };
}

type TableColumn = { name: string };

async function migrateTaskTable(database: SQLite.SQLiteDatabase) {
  const columns = await database.getAllAsync<TableColumn>('PRAGMA table_info(tasks)');
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('due_date')) {
    await database.execAsync('ALTER TABLE tasks ADD COLUMN due_date TEXT;');
  }
  if (!columnNames.has('priority')) {
    await database.execAsync(
      "ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'none';",
    );
  }
  if (!columnNames.has('due_time')) {
    await database.execAsync('ALTER TABLE tasks ADD COLUMN due_time TEXT;');
  }

  await database.execAsync('PRAGMA user_version = 3;');
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME)
      .then(async (database) => {
        await database.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL CHECK(length(trim(title)) > 0),
            description TEXT NOT NULL DEFAULT '',
            completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1)),
            due_date TEXT,
            due_time TEXT,
            priority TEXT NOT NULL DEFAULT 'none'
              CHECK(priority IN ('none', 'low', 'medium', 'high')),
            created_at TEXT NOT NULL
          );
          CREATE INDEX IF NOT EXISTS tasks_created_at_idx
            ON tasks(created_at DESC);
        `);
        await migrateTaskTable(database);
        return database;
      })
      .catch((error) => {
        databasePromise = null;
        throw repositoryError('TaskMate could not open its local database.', error);
      });
  }

  return databasePromise;
}

async function requireTask(database: SQLite.SQLiteDatabase, id: string): Promise<Task> {
  const row = await database.getFirstAsync<TaskRow>(
    `SELECT id, title, description, completed, due_date, due_time, priority, created_at
     FROM tasks
     WHERE id = ?`,
    id,
  );

  if (!row) {
    throw new TaskRepositoryError('That task no longer exists. Refresh and try again.');
  }

  return mapRow(row);
}

export const taskRepository: TaskRepository = {
  async list() {
    try {
      const database = await openDatabase();
      const rows = await database.getAllAsync<TaskRow>(
        `SELECT id, title, description, completed, due_date, due_time, priority, created_at
         FROM tasks
         ORDER BY created_at DESC, id DESC`,
      );
      return rows.map(mapRow);
    } catch (error) {
      throw repositoryError('TaskMate could not load your saved tasks.', error);
    }
  },

  async create(input: TaskInput) {
    const task = createTaskEntity(input);
    try {
      const database = await openDatabase();
      await database.runAsync(
        `INSERT INTO tasks
          (id, title, description, completed, due_date, due_time, priority, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        task.id,
        task.title,
        task.description,
        0,
        task.dueDate,
        task.dueTime,
        task.priority,
        task.createdAt,
      );
      return task;
    } catch (error) {
      throw repositoryError('TaskMate could not save this task.', error);
    }
  },

  async update(id: string, input: TaskInput) {
    const normalized = normalizeTaskInput(input);
    try {
      const database = await openDatabase();
      const result = await database.runAsync(
        `UPDATE tasks
         SET title = ?, description = ?, due_date = ?, due_time = ?, priority = ?
         WHERE id = ?`,
        normalized.title,
        normalized.description,
        normalized.dueDate,
        normalized.dueTime,
        normalized.priority,
        id,
      );
      if (result.changes === 0) {
        throw new TaskRepositoryError('That task no longer exists. Refresh and try again.');
      }
      return requireTask(database, id);
    } catch (error) {
      throw repositoryError('TaskMate could not update this task.', error);
    }
  },

  async setCompleted(id: string, completed: boolean) {
    try {
      const database = await openDatabase();
      const result = await database.runAsync(
        `UPDATE tasks SET completed = ? WHERE id = ?`,
        completed ? 1 : 0,
        id,
      );
      if (result.changes === 0) {
        throw new TaskRepositoryError('That task no longer exists. Refresh and try again.');
      }
      return requireTask(database, id);
    } catch (error) {
      throw repositoryError('TaskMate could not change this task.', error);
    }
  },

  async remove(id: string) {
    try {
      const database = await openDatabase();
      const result = await database.runAsync(`DELETE FROM tasks WHERE id = ?`, id);
      if (result.changes === 0) {
        throw new TaskRepositoryError('That task no longer exists. Refresh and try again.');
      }
    } catch (error) {
      throw repositoryError('TaskMate could not delete this task.', error);
    }
  },
};
