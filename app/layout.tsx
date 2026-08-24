import type { Metadata } from 'next';
import { Cormorant_Garamond, Lora, Josefin_Sans } from 'next/font/google';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});
const body = Lora({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});
const mono = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: "Rachel's Life Dashboard",
  description: 'A personal dashboard for tasks, habits, the weekly view, finances, notes, quarterly goals, and side quests.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body min-h-screen antialiased">{children}</body>
    </html>
  );
}
