import type { Metadata } from "next";
import { Lato, Amatic_SC } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { ReCaptchaProvider } from "@/components/ReCaptchaProvider";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  style: ["normal", "italic"],
});

const amaticSC = Amatic_SC({
  variable: "--font-amatic",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Gospelproject",
    template: "%s - Gospelproject",
  },
  description: "Gospelproject - gemeinsam Gospel erleben!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${lato.variable} ${amaticSC.variable} antialiased flex flex-col min-h-screen`}
      >
        <ThemeProvider>
          <ReCaptchaProvider>
            <Navigation />
            <div className="flex-1">{children}</div>
            <Footer />
          </ReCaptchaProvider>
        </ThemeProvider>
        {await (async () => {
          try {
            return (await draftMode()).isEnabled && <VisualEditing />;
          } catch {
            return null;
          }
        })()}
      </body>
    </html>
  );
}
