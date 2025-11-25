"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!token) {
      router.push("/login");
    } else {
      setUserRole(role || "");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md p-10 rounded-xl text-center">
        <h1 className="text-3xl font-semibold mb-4">Welcome to Admin Dashboard</h1>
        <p className="text-gray-600">You are logged in as <b>{userRole}</b>.</p>
      </div>
    </div>
  );
}
