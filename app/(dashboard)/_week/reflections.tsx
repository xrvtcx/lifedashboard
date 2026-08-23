'use client';

import { useState } from 'react';
import { saveReflection } from './actions';
import { Card } from '@/components/ui';

export function Reflections({ weekStart, content }: { weekStart: string; content: string }) {
  const [value, setValue] = useState(content);
  const [saved, setSaved] = useState(true);

  return (
    <Card className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        onBlur={async () => {
          await saveReflection(weekStart, value);
          setSaved(true);
        }}
        placeholder="How did the week go? What did you learn?"
        rows={6}
        className="w-full bg-transparent text-sm focus:outline-none resize-none"
      />
      <p className="text-xs text-ink/30 text-right">{saved ? 'Saved' : 'Unsaved changes \u2014 click away to save'}</p>
    </Card>
  );
}
