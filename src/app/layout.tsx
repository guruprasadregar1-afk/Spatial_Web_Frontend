import React from 'react';
import '@/styles/globals.css';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata = {
  title: 'Spatial Web Engine — Interactive 3D WebGL Platform',
  description: 'Production-ready 3D Spatial Web Canvas, Mini Jaipur Geospatial Showcase, and AI Semantic Engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b0f19] text-gray-100 min-h-screen antialiased">
        <Header />
        <Sidebar />
        <main className="pt-16 lg:pl-64 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
