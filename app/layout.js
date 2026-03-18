import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "office of daniel crowley",
  description: "wall of selected work",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            width: '50vw',
            height: '100vh',
            backgroundImage: 'url(/drawing.JPG)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
        {children}
      </body>
    </html>
  );
}
