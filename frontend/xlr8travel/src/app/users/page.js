"use client"; // so we can use React interactivity in Next.js 13
import React from "react";

export default function UsersPage() {
  return (
    // Outer wrapper ensuring the background fills the available vertical area.
    <div
      className="d-flex flex-column justify-content-center"
      style={{
        minHeight: "calc(100vh - 150px)", // Adjust this value to cover NavBar & Footer heights.
        backgroundColor: "#5DB4D0",
      }}
    >
      {/* BODY */}
      <div className="container-fluid pb-4">
        <div className="row">
          <div className="col-12 px-0 py-5">
            <div
              className="container py-5 border-0 shadow"
              style={{ backgroundColor: "#0C5F84", color: "white" }}
            >
              <h1 className="text-center pb-5">Manage Users</h1>
              <div className="col-12 pb-5 d-flex">
                <ul className="list-group list-group-horizontal flex-fill">
                  <li className="list-group-item flex-fill">user.email</li>
                  <li className="list-group-item flex-fill">user.password</li>
                  <li className="list-group-item flex-fill">user.username</li>
                  <li className="list-group-item flex-fill">
                    <form method="post">
                      <button type="submit" className="btn btn-danger">
                        Remove
                      </button>
                    </form>
                  </li>
                </ul>
              </div>
              <form method="post">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  required
                />
                <input type="email" name="email" placeholder="Email" required />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                />
                <button type="submit">Add User</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
