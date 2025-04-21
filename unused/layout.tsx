import React from 'react';
import '../styles/globals.css'; // Adjust path as needed

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body>
        {/* Any global providers, layouts */}
        {children}
      </body>
    </html>
  );
}