import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks, smsBriefingMappings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { toISODate } from '@/lib/week';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);
  const fromNumber = params.get('From');
  const messageBody = params.get('Body');

  // Verify it's from the expected number (basic security)
  if (fromNumber !== `+17039455621`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (!messageBody) {
    return NextResponse.json({ success: true });
  }

  try {
    const today = toISODate(new Date());
    const [mapping] = await db.select().from(smsBriefingMappings).where(eq(smsBriefingMappings.date, today));

    if (!mapping) {
      return NextResponse.json({ error: 'No mapping found for today' }, { status: 400 });
    }

    const taskMap = JSON.parse(mapping.taskMappings) as Record<string, number>;
    const numbers = messageBody.trim().split(/[\s,]+/).filter((n) => /^\d+$/.test(n));

    for (const num of numbers) {
      const taskId = taskMap[num];
      if (taskId) {
        await db.update(tasks).set({ status: 'done', updatedAt: new Date() }).where(eq(tasks.id, taskId));
      }
    }

    // Return Twilio-compatible XML response
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Tasks updated!</Message>
</Response>`,
      { headers: { 'Content-Type': 'application/xml' } }
    );
  } catch (err) {
    console.error('SMS processing error:', err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
