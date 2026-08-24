import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  numeric,
  date,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ---------------- enums ----------------
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high']);
export const goalStatusEnum = pgEnum('goal_status', ['active', 'completed', 'archived']);
export const txnContextEnum = pgEnum('txn_context', ['personal', 'business']);
export const txnTypeEnum = pgEnum('txn_type', ['income', 'expense']);
export const habitSectionEnum = pgEnum('habit_section', ['daily', 'devotional']);
export const quarterGoalCategoryEnum = pgEnum('quarter_goal_category', [
  'finance',
  'health',
  'business',
  'personal',
]);
export const financeAccountTypeEnum = pgEnum('finance_account_type', [
  'credit_card',
  'savings',
  'checking',
  'investment',
  'loan',
  'other',
]);
export const sideQuestCategoryEnum = pgEnum('side_quest_category', [
  'reading',
  'studying',
  'hobby',
  'certification',
  'exam',
  'other',
]);
export const sideQuestStatusEnum = pgEnum('side_quest_status', ['active', 'completed']);

// ---------------- tasks ----------------
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').notNull().default('todo'),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  dueDate: timestamp('due_date', { mode: 'date' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---------------- habits (weekly-goal based tracker) ----------------
export const habits = pgTable('habits', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  section: habitSectionEnum('section').notNull().default('daily'),
  icon: text('icon').notNull().default('Star'),
  color: text('color').notNull().default('#7A1F2B'),
  weeklyGoal: integer('weekly_goal').notNull().default(7),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const habitLogs = pgTable(
  'habit_logs',
  {
    id: serial('id').primaryKey(),
    habitId: integer('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    date: date('date', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    habitDateUnique: uniqueIndex('habit_logs_habit_date_unique').on(table.habitId, table.date),
  })
);

// ---------------- legacy simple goals ----------------
// NOTE: the standalone /goals page has been retired in favor of the Quarter
// View's per-category quarterly goals below. This table is intentionally left
// in the schema (rather than dropped) so `db:push` never deletes any goal
// rows you may already have — it's just no longer read by any page.
export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  targetDate: timestamp('target_date', { mode: 'date' }),
  progress: integer('progress').notNull().default(0),
  status: goalStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---------------- notes ----------------
export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  pinned: boolean('pinned').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---------------- finance: transactions (cash flow, existing /finance tab) ----------------
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  context: txnContextEnum('context').notNull().default('personal'),
  type: txnTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category: text('category').notNull(),
  description: text('description'),
  date: date('date', { mode: 'string' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---------------- finance: accounts (balances snapshot, used by Quarter View) ----------------
export const financeAccounts = pgTable('finance_accounts', {
  id: serial('id').primaryKey(),
  context: txnContextEnum('context').notNull().default('personal'),
  name: text('name').notNull(),
  accountType: financeAccountTypeEnum('account_type').notNull().default('checking'),
  balance: numeric('balance', { precision: 12, scale: 2 }).notNull().default('0'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---------------- week view: hourly schedule ----------------
export const scheduleBlocks = pgTable(
  'schedule_blocks',
  {
    id: serial('id').primaryKey(),
    date: date('date', { mode: 'string' }).notNull(),
    hour: integer('hour').notNull(), // 0-23
    label: text('label').notNull().default(''),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    dateHourUnique: uniqueIndex('schedule_blocks_date_hour_unique').on(table.date, table.hour),
  })
);

// ---------------- week view: gym sessions (also feeds the Quarter View chart) ----------------
export const gymSessions = pgTable('gym_sessions', {
  id: serial('id').primaryKey(),
  date: date('date', { mode: 'string' }).notNull().unique(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---------------- week view: weekly focus + sub-goals ----------------
export const weeklyFocus = pgTable('weekly_focus', {
  id: serial('id').primaryKey(),
  weekStart: date('week_start', { mode: 'string' }).notNull().unique(),
  title: text('title').notNull().default(''),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const weeklyFocusGoals = pgTable('weekly_focus_goals', {
  id: serial('id').primaryKey(),
  weekStart: date('week_start', { mode: 'string' }).notNull(),
  title: text('title').notNull(),
  completed: boolean('completed').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---------------- week view: reflections ----------------
export const reflections = pgTable('reflections', {
  id: serial('id').primaryKey(),
  weekStart: date('week_start', { mode: 'string' }).notNull().unique(),
  content: text('content').notNull().default(''),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---------------- side quests ----------------
export const sideQuests = pgTable('side_quests', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: sideQuestCategoryEnum('category').notNull().default('other'),
  progress: integer('progress').notNull().default(0),
  status: sideQuestStatusEnum('status').notNull().default('active'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---------------- quarter view: goals, achievements, parking lot ----------------
export const quarterlyGoals = pgTable('quarterly_goals', {
  id: serial('id').primaryKey(),
  quarter: text('quarter').notNull(), // e.g. "2026-Q3"
  category: quarterGoalCategoryEnum('category').notNull().default('personal'),
  title: text('title').notNull(),
  targetValue: numeric('target_value', { precision: 12, scale: 2 }),
  currentValue: numeric('current_value', { precision: 12, scale: 2 }),
  progress: integer('progress').notNull().default(0),
  status: goalStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  quarter: text('quarter').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  achievedOn: date('achieved_on', { mode: 'string' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const parkingLot = pgTable('parking_lot', {
  id: serial('id').primaryKey(),
  quarter: text('quarter').notNull(),
  title: text('title').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---- Google OAuth (one per user for now; we're single-user, so just one row) ----
export const googleOAuthTokens = pgTable('google_oauth_tokens', {
  id: serial('id').primaryKey(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---- Calendar events (synced from Google, cached locally) ----
export const calendarEvents = pgTable('calendar_events', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').notNull().unique(), // Google's event ID
  date: date('date', { mode: 'string' }).notNull(),
  startTime: text('start_time').notNull(), // "HH:MM" format, EST
  endTime: text('end_time').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---- SMS briefing state (map task numbers to task IDs for today's replies) ----
export const smsBriefingMappings = pgTable('sms_briefing_mappings', {
  id: serial('id').primaryKey(),
  date: date('date', { mode: 'string' }).notNull().unique(),
  taskMappings: text('task_mappings').notNull(), // JSON: { "1": taskId, "2": taskId, ... }
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
