"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from 'next/navigation';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import { NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart } from "react-icons/fa"; // Cart icon
import { useAuth } from '@/contexts/AuthContext'; // Ensure path is correct

export default function NavBarComponent() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, cartItemCount } = useAuth();

  // --- Link Data ---
  const baseMainLinks = [ { href: "/", label: "Home" }, { href: "#", label: "Plan" }, { href: "/checkin/1", label: "Check-in & Booking" } ];
  const adminSpecificLinks = [ { href: "/flights/manage", label: "Manage Flights" }, { href: "/users", label: "Manage Users" } ];
  const guestAuthLinks = [ { href: "/login", label: "Log In" }, { href: "/signup", label: "Sign Up" } ];

  // --- Determine Role ---
  let isAdmin = false;
  if (isAuthenticated && user && typeof user.username === 'string') {
      isAdmin = user.username.trim() === 'user2';
  }
  const mainLinks = baseMainLinks;


  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm h-20 md:h-24">
      <Container fluid="lg" className="px-3">
        <Navbar.Brand as={Link} href="/" className="p-0 d-inline-block me-lg-3">
          <Image src="/removedbg.png" className="object-contain h-14 w-auto md:h-20 align-middle" alt="xlr8Travel logo" fluid />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-navbar-toggle">
           <span className="middle-line"></span>
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
          {/* Centered Links */}
          <Nav className="mx-auto align-items-center">
            {/* Base Links */}
            {mainLinks.map(link => (
              <Nav.Link key={link.href} as={Link} href={link.href} className="text-uppercase mx-lg-2 my-1" active={pathname === link.href}>
                <span className="nav-link-text-underline">{link.label}</span>
              </Nav.Link>
            ))}

            {/* Admin Links - Mobile ONLY (Stacked List) */}
            {isAuthenticated && isAdmin && adminSpecificLinks.map(link => (
                <div key={link.href + "-mobile"} className="d-lg-none w-100 text-center my-1">
                    <Nav.Link as={Link} href={link.href} className="text-uppercase d-inline-block py-1" active={pathname === link.href}>
                        <span className="nav-link-text-underline">{link.label}</span>
                    </Nav.Link>
                </div>
            ))}

            {/* Admin "Manage" Dropdown - Desktop ONLY */}
            {isAuthenticated && isAdmin && (
                <div className="d-none d-lg-block mx-lg-2 my-1">
                    <NavDropdown
                        title={<span className="nav-link-text-underline">Manage</span>}
                        id="manage-admin-dropdown"
                        className="text-uppercase"
                        menuVariant="dark"
                    >
                        <div className="manage-dropdown-grid-wrapper">
                            {adminSpecificLinks.map((link) => (
                                <NavDropdown.Item key={link.href} as={Link} href={link.href} active={pathname === link.href} className="text-wrap">
                                    {link.label}
                                </NavDropdown.Item>
                            ))}
                        </div>
                    </NavDropdown>
                </div>
            )}
          </Nav> {/* End Centered Links Section */}

          {/* Right-aligned Auth Section */}
          <Nav className="align-items-center">
            {isAuthenticated ? (
              // VIEW WHEN LOGGED IN
              <>
                {/* --- Cart Icon/Link - SHOW ONLY IF NOT ADMIN --- */}
                {!isAdmin && (
                  <Nav.Link
                      as={Link}
                      href="/cart"
                      className="text-uppercase mx-lg-2 my-1 d-flex align-items-center position-relative" // Removed text-light
                      active={pathname === '/cart'} // Added active check
                      aria-label="Shopping Cart"
                  >
                      {/* Icon with Increased margin-end */}
                      <FaShoppingCart size="1.3em" className="me-2" /> {/* Changed me-1 to me-2 */}
                      {/* Text wrapped in span for hover effect */}
                      <span className="nav-link-text-underline">My Cart</span>
                      {/* Badge */}
                      {cartItemCount > 0 && (
                          <Badge
                             pill bg="danger"
                             className="position-absolute top-0 start-100 translate-middle"
                             style={{ fontSize: '0.6em', padding: '0.3em 0.5em' }}
                          >
                            {cartItemCount}
                            <span className="visually-hidden">items in cart</span>
                          </Badge>
                      )}
                  </Nav.Link>
                )}
                {/* --- End Cart Icon/Link --- */}

                {/* Logout Button */}
                <Button variant="outline-light" size="sm" onClick={logout} className={isAdmin ? 'ms-lg-2 my-1' : 'ms-lg-3 my-1'}>
                  Log Out
                </Button>
              </>
            ) : (
              // VIEW WHEN LOGGED OUT
              guestAuthLinks.map(link => (
                 <Nav.Link key={link.href} as={Link} href={link.href} className="text-uppercase ms-lg-2 my-1" active={pathname === link.href}>
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