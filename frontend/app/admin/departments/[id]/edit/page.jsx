"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter, useParams } from "next/navigation";

export default function EditDepartment() {
  const router = useRouter();
  const params = useParams();
  const deptId = params.id;

  const [name, setName] = useState("");
  const [type, setType] = useState("UG");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  // Load existing department
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    api
      .get(`/admin/departments/${deptId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setName(res.data.name);
        setType(res.data.type);
        setAddress(res.data.address);
      })
      .catch(() => router.push("/admin/departments"));
  }, []);

  // Submit update
  const updateDepartment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await api.put(
        `/admin/departments/${deptId}`,
        { name, type, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);

      setTimeout(() => {
        router.push("/admin/departments");
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-6">Edit Department</h1>

      {message && (
        <p className="mb-4 text-green-600 font-medium">{message}</p>
      )}

      <form className="space-y-5" onSubmit={updateDepartment}>
        <div>
          <label className="font-medium">Department Name</label>
          <input
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="font-medium">Program Type</label>
          <select
            className="w-full border p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="UG">UG</option>
            <option value="PG">PG</option>
            <option value="Research">Research</option>
            <option value="Engineering">Engineering</option>
            <option value="Science">Science</option>
          </select>
        </div>

        <div>
          <label className="font-medium">Address</label>
          <textarea
            className="w-full border p-2 rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Update Department
        </button>
      </form>
    </div>
  );
}
