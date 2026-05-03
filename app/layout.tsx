import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Task Calendar',
  description: 'Task and calendar management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-100">
        {children}
      </body>
    </html>
  );
}
