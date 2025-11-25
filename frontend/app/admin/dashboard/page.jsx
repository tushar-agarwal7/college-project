"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    api
      .get("/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Left Navigation */}
      <aside className="w-64 p-6 bg-white shadow-md">
        <h2 className="text-xl font-semibold mb-6">Navigation</h2>

        <div className="space-y-3">
<button className="block w-full text-left p-3 rounded bg-gray-100"
  onClick={() => router.push("/admin/departments")}
>
  Departments
</button>
          <button className="block w-full text-left p-3 rounded bg-gray-100">Users</button>
          <button className="block w-full text-left p-3 rounded bg-gray-100">Add User</button>
        </div>
      </aside>

      {/* Main Dashboard */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-2 gap-6">
          <DashboardCard title="Total Departments" value={data.totalDepartments} color="bg-blue-100" />
          <DashboardCard title="Total Students" value={data.totalStudents} color="bg-green-100" />
          <DashboardCard title="Total Professors" value={data.totalProfessors} color="bg-yellow-100" />
          <DashboardCard title="Total HODs" value={data.totalHods} color="bg-purple-100" />
        </div>
      </main>
    </div>
  );
}

const DashboardCard = ({ title, value, color }) => (
  <div className={`p-6 rounded-xl shadow-sm ${color}`}>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);
