import React from "react";
import FarmerDashboard from "@/components/FarmerDashboard";
import ProviderDashboard from "@/components/ProviderDashboard";
import { useApp } from "@/lib/context";

export default function HomeScreen() {
  const { role } = useApp();

  if (role === "provider") {
    return <ProviderDashboard />;
  }

  return <FarmerDashboard />;
}
