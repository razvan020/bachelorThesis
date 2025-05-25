"use client";

import { useState, useEffect } from "react";
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
  const [avatarUrl, setAvatarUrl] = useState("/avatarSrc.png");

  // Base links
  const baseLinks = [
    { href: "/", label: "Home" },
    { href: "/plan", label: "Plan" },
    { href: "/check-in", label: "Check-in & Booking" },
    { href: "/boarding-passes", label: "Boarding Passes" },
  ];
  if (isAdmin) {
    baseLinks.push({ href: "/dashboard", label: "Dashboard" });
  }

  const getAvatarSrc = async () => {
    if (!isAuthenticated) {
      return "/avatarSrc.png";
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/user/me/avatar", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load avatar");
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error loading avatar:", error);
      return "/avatarSrc.png"; // Fallback on error
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getAvatarSrc().then((src) => {
        setAvatarUrl(src);
      });
    } else {
      setAvatarUrl("/avatarSrc.png");
    }

    // Cleanup function to revoke object URL when component unmounts
    return () => {
      if (avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [isAuthenticated]);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container fluid="lg">
        <Navbar.Brand as={Link} href="/">
          <Image src="/removedbg.png" fluid alt="xlr8Travel logo" />
        </Navbar.Brand>

        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-between">
          {/* Left / Center Links */}
          <Nav className="mx-auto">
            {baseLinks.map((link) => (
              <Nav.Link
                key={link.href}
                as={Link}
                href={link.href}
                active={pathname === link.href}
                className="text-uppercase mx-lg-2"
              >
                <span className="nav-link-text-underline">{link.label}</span>
              </Nav.Link>
            ))}
          </Nav>

          {/* Right Auth Section */}
          <Nav className="align-items-center">
            {isAuthenticated ? (
              <>
                {/* Shopping cart for non-admins */}
                {!isAdmin && (
                  <Nav.Link
                    as={Link}
                    href="/cart"
                    active={pathname === "/cart"}
                    className="position-relative me-3"
                    aria-label="Shopping Cart"
                  >
                    <FaShoppingCart size="1.3em" className="me-2" />
                    <span className="nav-link-text-underline">My Cart</span>
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
                    src={avatarUrl}
                    onError={(e) => {
                      e.currentTarget.src = "/avatarSrc.png";
                    }}
                    roundedCircle
                    width={30}
                    height={30}
                    alt={`${user?.username || "Your"} profile`}
                  />
                </Nav.Link>

                {/* Logout button */}
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
                  <span className="nav-link-text-underline">Log In</span>
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  href="/signup"
                  active={pathname === "/signup"}
                >
                  <span className="nav-link-text-underline">Sign Up</span>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
