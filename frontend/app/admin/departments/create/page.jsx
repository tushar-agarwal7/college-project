"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateDepartment() {
  const [name, setName] = useState("");
  const [type, setType] = useState("UG");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const submitHandler = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
   console.log({ name, type, address });
    try {
      const res = await api.post(
        "/admin/departments/create",
        { name, type, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(res.data);

      setMessage(res.data.message);
      setName("");
      setAddress("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-6">Create Department</h1>

      {message && <p className="mb-4 text-blue-600">{message}</p>}

      <form className="space-y-5" onSubmit={submitHandler}>
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
          Create Department
        </button>
      </form>
    </div>
  );
}
