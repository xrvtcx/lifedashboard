import { db } from '@/db';
import { tasks } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { createTask } from './actions';
import { TaskList } from './task-list';
import { Card, SectionLabel } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const allTasks = await db.select().from(tasks).orderBy(asc(tasks.dueDate));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Tasks</h1>
        <p className="text-ink/60 text-sm mt-1">What needs doing, in order.</p>
      </div>

      <Card>
        <SectionLabel>New entry</SectionLabel>
        <form action={createTask} className="flex flex-col sm:flex-row gap-3">
          <input
            name="title"
            placeholder="Describe the task…"
            required
            className="flex-1 bg-transparent border border-slate rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-ledger"
          />
          <select
            name="priority"
            defaultValue="medium"
            className="bg-transparent border border-slate rounded-sm px-3 py-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            name="dueDate"
            className="bg-transparent border border-slate rounded-sm px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-ink text-chalk px-4 py-2 rounded-sm text-sm font-medium hover:bg-ledgerdark transition-colors"
          >
            Add
          </button>
        </form>
      </Card>

      <TaskList tasks={allTasks} />
    </div>
  );
}
