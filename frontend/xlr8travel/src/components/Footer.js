"use client";
import React from "react";
import Link from "next/link";

// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image'; // Optional: Use for cleaner image handling
import Nav from 'react-bootstrap/Nav';    // For potential link lists
import Stack from 'react-bootstrap/Stack';  // For arranging icons

export default function Footer() {
  const currentYear = new Date().getFullYear(); // Get current year for copyright

  return (
    // Use Container as footer, set background, text color, and padding
    // data-bs-theme="dark" helps ensure text/link contrast
    <Container fluid as="footer" style={{ backgroundColor: "#000000" }} className="text-light py-4" data-bs-theme="dark">
      <Row className="justify-content-between align-items-center gy-4"> {/* gy-4 adds vertical gap on wrap */}

        {/* Column 1: Logo and Copyright */}
        <Col xs={12} md={4} lg={3} className="text-center text-md-start">
          <Link href="/" passHref legacyBehavior>
            {/* Using Nav.Link makes the whole area clickable if needed, or just use <a> */}
            <Nav.Link className="p-0 d-inline-block mb-2">
              <Image
                src="/removedbg.png" // Your logo path
                width={150} // Adjust size as needed
                height={150} // Adjust size as needed
                alt="xlr8Travel logo"
              />
            </Nav.Link>
          </Link>
          <p className="text-muted small mb-0"> {/* Use text-muted for subtle copyright */}
             &copy; {currentYear} xlr8Travel. All rights reserved.
          </p>
        </Col>

        {/* Column 2: Quick Links (Example - Add your actual links) */}
        {/* You can add more columns like this if you have many links */}
        <Col xs={6} sm={4} md={2} lg={2}>
          <h5 className="mb-3 fs-6">Company</h5>
          <Nav className="flex-column">
            <Nav.Link as={Link} href="/about" className="p-0 mb-1 text-light text-opacity-75">About Us</Nav.Link>
            <Nav.Link as={Link} href="/careers" className="p-0 mb-1 text-light text-opacity-75">Careers</Nav.Link>
            <Nav.Link as={Link} href="/press" className="p-0 mb-1 text-light text-opacity-75">Press</Nav.Link>
            {/* Add more links */}
          </Nav>
        </Col>

         {/* Column 3: Support Links (Example - Add your actual links) */}
        <Col xs={6} sm={4} md={2} lg={2}>
           <h5 className="mb-3 fs-6">Support</h5>
          <Nav className="flex-column">
            <Nav.Link as={Link} href="/contact" className="p-0 mb-1 text-light text-opacity-75">Contact Us</Nav.Link>
            <Nav.Link as={Link} href="/faq" className="p-0 mb-1 text-light text-opacity-75">FAQ</Nav.Link>
            <Nav.Link as={Link} href="/privacy" className="p-0 mb-1 text-light text-opacity-75">Privacy Policy</Nav.Link>
            <Nav.Link as={Link} href="/terms" className="p-0 mb-1 text-light text-opacity-75">Terms of Service</Nav.Link>
            {/* Add more links */}
          </Nav>
        </Col>


        {/* Column 4: Social Media & App Downloads */}
        <Col xs={12} md={4} lg={3} className="text-center text-md-end">
          {/* Social Media */}
          <div className="mb-3">
            <h5 className="mb-2 fs-6">Follow Us</h5>
            {/* Stack arranges items, gap adds space */}
            <Stack direction="horizontal" gap={3} className="justify-content-center justify-content-md-end">
               <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Image src="/icons8-facebook-50.png" alt="Facebook" width={32} height={32} />
               </a>
               <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                 <Image src="/icons8-instagram-50.png" alt="Instagram" width={32} height={32} />
               </a>
               <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                 <Image src="/icons8-twitter-50.png" alt="Twitter" width={32} height={32} />
               </a>
               <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                 <Image src="/icons8-youtube-50.png" alt="YouTube" width={32} height={32} />
               </a>
            </Stack>
          </div>

          {/* App Downloads */}
          <div>
             <h5 className="mb-2 fs-6">Download the App</h5>
              <Stack direction="horizontal" gap={3} className="justify-content-center justify-content-md-end">
                {/* Replace # with actual store links */}
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Download on the Play Store">
                   <Image src="/icons8-play-store-50.png" alt="Play Store" width={32} height={32} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store">
                   <Image src="/icons8-app-store-50.png" alt="App Store" width={32} height={32} />
                </a>
             </Stack>
          </div>
        </Col>

      </Row>
    </Container>
  );
}