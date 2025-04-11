"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from 'next/navigation';

// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
// You might need Offcanvas or Collapse logic for mobile depending on exact toggle behavior desired
// import Offcanvas from 'react-bootstrap/Offcanvas';

export default function NavBarComponent() {
  const pathname = usePathname();

  const mainNavLinks = [
    { href: "/", label: "Home" },
    { href: "#", label: "Plan" }, // Update href as needed
    { href: "/checkin/1", label: "Check-in & Booking" }, // Update href as needed
  ];

  const authNavLinks = [
    { href: "/login", label: "Log In" },
    { href: "/signup", label: "Sign Up" },
  ];

  // NOTE: Adjust Navbar height (h-*) and logo sizes (h-*/w-*) below
  //       to find the best visual balance for your specific logo and preference.

  return (
    // Added responsive height to Navbar (e.g., h-20 mobile, md:h-24 medium+)
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm h-20 md:h-24">
      {/* Using fluid="lg" makes container full-width below lg breakpoint (more space for logo on mobile) */}
      <Container fluid="lg">
        <Navbar.Brand as={Link} href="/">
          <img
            src="/removedbg.png" // Your logo path

            // REMOVED width/height props
            // width={80}
            // height={80}

            // ADD responsive size classes (Example values - ADJUST AS NEEDED!)
            // Controls height, width adjusts automatically.
            // h-14 (56px) on mobile, md:h-20 (80px) on medium+, fitting within Navbar height
            className="object-contain h-14 w-auto md:h-20"

            alt="xlr8Travel logo"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">

          {/* Main Nav Links - Centered */}
          <Nav className="mx-auto">
             {mainNavLinks.map(link => (
               <Nav.Link
                 key={link.href}
                 as={Link}
                 href={link.href}
                 className="text-uppercase" // Keep styling classes
                 active={pathname === link.href} // Active state logic
               >
                 {/* Wrap label in span for the text-width underline hover effect */}
                 <span className="nav-link-text-underline">{link.label}</span>
               </Nav.Link>
             ))}
          </Nav>

           {/* Auth Nav Links - Right aligned */}
          <Nav>
             {authNavLinks.map(link => (
               <Nav.Link
                 key={link.href}
                 as={Link}
                 href={link.href}
                 className="text-uppercase" // Keep styling classes
                 active={pathname === link.href} // Active state logic
                >
                 {/* Apply the same underline effect if desired */}
                 <span className="nav-link-text-underline">{link.label}</span>
                 {/* Or keep as plain text if underline not wanted here: */}
                 {/* {link.label} */}
               </Nav.Link>
             ))}
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}