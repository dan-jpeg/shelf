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
          className="hidden "
          style={{
            position: 'fixed',
            right: 0,
            bottom: 0,
            width: '210px',
            height: '120px',
            backgroundImage: 'url(https://firebasestorage.googleapis.com/v0/b/common-base-d538e.firebasestorage.app/o/01-major-img%2Fflower-drawing.png?alt=media&token=76dd23df-55ad-4ad8-84fd-6a8eb0c554e1)',
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
