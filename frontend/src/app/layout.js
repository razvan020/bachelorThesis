// app/layout.js (or whichever layout file you’re using)
"use client";

import "./globals.css";
import NavBar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "@/components/BoostrapClient";
import { AuthProvider } from "@/contexts/AuthContext";
import ThemeRegistry from "@/components/ThemeRegistry";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ThemeProvider } from "@/contexts/ThemeContext";

// load your public key from env
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

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

        {/* jQuery & jQueryUI (if you still need them) */}
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
      <body className={poppins.className}>
        <ThemeProvider>
          <ThemeRegistry>
            <AuthProvider>
              {/* Wrap your entire app in Stripe Elements */}
              <Elements stripe={stripePromise}>
                <div className="pageWrapper">
                  <BootstrapClient />
                  <NavBar />
                  <main className="flex-grow-1">{children}</main>
                  <Footer />
                </div>
              </Elements>
            </AuthProvider>

            {/* Bootstrap JS */}
            <Script
              src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          </ThemeRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
