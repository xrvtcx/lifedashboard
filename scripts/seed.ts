import 'dotenv/config';
import { db } from '../db';
import { tasks, habits, goals, notes, transactions } from '../db/schema';

async function seed() {
  await db.insert(tasks).values([
    { title: 'Set up the dashboard', priority: 'high', status: 'done' },
    { title: 'Connect the Neon database', priority: 'high', status: 'done' },
    { title: "Review this week's goals", priority: 'medium' },
  ]);

  const [habit] = await db.insert(habits).values({ name: 'Read 20 minutes' }).returning();
  console.log('Seeded habit:', habit?.name);

  await db.insert(goals).values({ title: 'Ship v1 of the dashboard', progress: 40 });

  await db.insert(notes).values({
    title: 'Welcome',
    content: "This is your first note. Edit or delete it any time — it's just here to show the layout.",
    pinned: true,
  });

  const today = new Date().toISOString().slice(0, 10);
  await db.insert(transactions).values([
    { context: 'personal', type: 'income', amount: '2500.00', category: 'Salary', date: today },
    { context: 'personal', type: 'expense', amount: '68.50', category: 'Groceries', date: today },
    { context: 'business', type: 'income', amount: '450.00', category: 'Consulting', date: today },
  ]);

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
