"use client";
import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-2" style={{ backgroundColor: "#000000"}}>
      <div className="container-fluid text-light">
        <div className="row my-0">
          <div className="col-8 mb-0">
          <Link className="navbar-brand fs-2" href="/" style={{ marginLeft: "10%" }}>
          {/* If the image is in /public/, use a root-relative path like /image-removebg-preview.png */}
          <img
            src="/removedbg.png"
            width="200"
            height="200"
            className="align-top"
            alt=""
          />
        </Link>
          </div>
          <div className="col-4 text-end mb-0">
            <p className="mb-0 ms-auto mt-0 fs-2 my-0">
              Follow us on social media!
            </p>
          </div>
        </div>
        <div className="row me-3 mt-0">
          <div className="col-7 col-sm-7"></div>
          <div className="col-5 col-sm-5 mx-0 px-0 text-end">
            <img src="/icons8-facebook-50.png" alt="" />
            <img src="/icons8-instagram-50.png" alt="" />
            <img src="/icons8-twitter-50.png" alt="" />
            <img src="/icons8-youtube-50.png" alt="" />
          </div>
        </div>
        <div className="row mt-4 text-end">
          <div className="col-12 mt-0 text-end">
            <p className="mb-0 ms-auto mt-0 fs-2">Download the app on</p>
            <img src="/icons8-play-store-50.png" alt="" />
            <img src="/icons8-app-store-50.png" alt="" />
          </div>
        </div>
      </div>
    </footer>
  );
}
