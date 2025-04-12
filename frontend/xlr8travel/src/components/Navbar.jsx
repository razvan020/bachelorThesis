"use client";

 import Link from "next/link";
 import React from "react";
 import { usePathname } from 'next/navigation';
 import Container from 'react-bootstrap/Container';
 import Nav from 'react-bootstrap/Nav';
 import Navbar from 'react-bootstrap/Navbar';
 import Button from 'react-bootstrap/Button';
 import Image from 'react-bootstrap/Image';
 import { useAuth } from '@/contexts/AuthContext'; // Ensure path is correct

 export default function NavBarComponent() {
   const pathname = usePathname();
   const { user, isAuthenticated, logout } = useAuth();

   console.log("NavBarComponent Render:", { isAuthenticated, user });

   // Define Link Data
   const baseMainLinks = [
     { href: "/", label: "Home" },
     { href: "#", label: "Plan" },
     { href: "/checkin/1", label: "Check-in & Booking" },
   ];
   const adminSpecificLinks = [
      { href: "/flights/manage", label: "Manage Flights" },
      { href: "/users", label: "Manage Users" },
   ];
   const guestAuthLinks = [
     { href: "/login", label: "Log In" },
     { href: "/signup", label: "Sign Up" },
   ];

   // --- Determine role and select links ---
   // CHANGE: Check for the actual admin username 'user2'
   let isAdmin = false;
   if (isAuthenticated && user && typeof user.username === 'string') {
       // Check against the username stored in the database ('user2')
       isAdmin = user.username.trim() === 'user2';
   }

   const mainLinks = isAdmin ? [...baseMainLinks, ...adminSpecificLinks] : baseMainLinks;

    console.log("Is Admin:", isAdmin);
    console.log("Final mainLinks:", mainLinks);


   return (
     <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm h-20 md:h-24">
       <Container fluid="lg" className="px-3">
         <Navbar.Brand as={Link} href="/" className="p-0 d-inline-block">
           <Image
             src="/removedbg.png"
             className="object-contain h-14 w-auto md:h-20 align-middle"
             alt="xlr8Travel logo"
             fluid
           />
         </Navbar.Brand>
         <Navbar.Toggle aria-controls="basic-navbar-nav" />
         <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">

           {/* Main Nav Links */}
           <Nav className="mx-auto">
             { mainLinks.map(link => (
               <Nav.Link
                 key={link.href}
                 as={Link}
                 href={link.href}
                 className="text-uppercase"
                 active={pathname === link.href}
               >
                 <span className="nav-link-text-underline">{link.label}</span>
               </Nav.Link>
             ))}
           </Nav>

           {/* Auth Section */}
           <Nav>
             {isAuthenticated ? (
               // User is logged in - Show Logout
               <Button variant="outline-light" size="sm" onClick={logout}>
                 Log Out
               </Button>
             ) : (
               // User is logged out - Show Login/Signup
               guestAuthLinks.map(link => (
                 <Nav.Link
                   key={link.href}
                   as={Link}
                   href={link.href}
                   className="text-uppercase"
                   active={pathname === link.href}
                 >
                   <span className="nav-link-text-underline">{link.label}</span>
                 </Nav.Link>
               ))
             )}
           </Nav>

         </Navbar.Collapse>
       </Container>
     </Navbar>
   );
 }