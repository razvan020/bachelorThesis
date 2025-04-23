// app/dashboard/layout.js
"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

// import your three tab‐components:
import Overview from "@/components/Overview";
import ManageUsers from "@/components/ManageUsers";
import ManageFlights from "@/components/ManageFlights";

export default function DashboardRouteLayout({ children }) {
  const [selectedTab, setSelectedTab] = useState("overview");

  // map IDs → actual components
  const tabContent = {
    overview: <Overview />,
    users: <ManageUsers />,
    flights: <ManageFlights />,
  };

  return (
    <DashboardLayout selectedTab={selectedTab} onTabChange={setSelectedTab}>
      {/*
        We completely ignore `children` (your page.js).
        Instead we render the right tab here.
      */}
      {tabContent[selectedTab]}
    </DashboardLayout>
  );
}
