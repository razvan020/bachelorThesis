"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import { FaShoppingCart } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

export default function NavBarComponent() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, cartItemCount } = useAuth();
  const isAdmin = isAuthenticated && user?.username === "user2";

  // Base links
  const baseLinks = [
    { href: "/", label: "Home" },
    { href: "/plan", label: "Plan" },
    { href: "/checkin/1", label: "Check-in & Booking" },
  ];
  if (isAdmin) {
    baseLinks.push({ href: "/dashboard", label: "Dashboard" });
  }

  // pick avatar URL or fallback
  const avatarSrc = user?.profileImage || "/avatarSrc.png";

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container fluid="lg">
        <Navbar.Brand as={Link} href="/">
          <Image src="/removedbg.png" fluid alt="xlr8Travel logo" />
        </Navbar.Brand>

        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-between">
          {/* Left/Center Links */}
          <Nav className="mx-auto">
            {baseLinks.map((link) => (
              <Nav.Link
                key={link.href}
                as={Link}
                href={link.href}
                active={pathname === link.href}
                className="text-uppercase mx-lg-2"
              >
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          {/* Right Auth Section */}
          <Nav className="align-items-center">
            {isAuthenticated ? (
              <>
                {/* cart for non-admins */}
                {!isAdmin && (
                  <Nav.Link
                    as={Link}
                    href="/cart"
                    active={pathname === "/cart"}
                    className="position-relative me-3"
                    aria-label="Shopping Cart"
                  >
                    <FaShoppingCart size="1.3em" className="me-2" />
                    My Cart
                    {cartItemCount > 0 && (
                      <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                        {cartItemCount}
                      </span>
                    )}
                  </Nav.Link>
                )}

                {/* Profile avatar */}
                <Nav.Link
                  as={Link}
                  href="/profile"
                  className="d-flex align-items-center me-3"
                >
                  <Image
                    src={avatarSrc}
                    roundedCircle
                    width={30}
                    height={30}
                    alt={`${user.username || "Your"} profile`}
                  />
                </Nav.Link>

                {/* Logout */}
                <Button variant="outline-light" size="sm" onClick={logout}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  href="/login"
                  active={pathname === "/login"}
                >
                  Log In
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  href="/signup"
                  active={pathname === "/signup"}
                >
                  Sign Up
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
