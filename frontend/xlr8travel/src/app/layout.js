import './globals.css';
import NavBar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter } from 'next/font/google';
import Script from "next/script";
import 'bootstrap/dist/css/bootstrap.min.css';
import BootstrapClient from '@/components/BoostrapClient';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
})

export const metadata = {
  title: 'Xlr8Travel',
  description: 'Adapted Next.js version of your original HTML',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>Xlr8Travel</title>


        <Script
          src="https://code.jquery.com/jquery-1.12.4.js"
          integrity="sha256-Qw82+bXyGq6MydymqBxNPYTaUXXq7c8v3CwiYwLLNXU="
          crossOrigin="anonymous"
        />

        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.js" />

        <link
          rel="stylesheet"
          type="text/css"
          media="screen"
          href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.css"
        />
      </head>
      <body className={inter.className}>
      <div className="pageWrapper">
        <BootstrapClient/>
        <NavBar />
        <main className="flex-grow-1">
          {children}
        </main>
        <Footer />
        </div>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
