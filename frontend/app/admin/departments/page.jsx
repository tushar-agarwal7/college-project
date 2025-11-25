"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DepartmentsList() {
  const router = useRouter();
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const loadDepartments = () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    api
      .get(`/admin/departments?search=${search}&type=${type}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setDepartments(res.data.departments);
        setPage(res.data.page);
        setPages(res.data.pages);
      });
  };

  const deleteDepartment = async (id) => {
  const token = localStorage.getItem("token");

  const confirmDelete = confirm("Are you sure you want to delete this department?");

  if (!confirmDelete) return;

  try {
    const res = await api.delete(`/admin/departments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert(res.data.message);
    loadDepartments(); // Refresh list
  } catch (err) {
    alert(err.response?.data?.message || "Delete failed");
  }
};


  useEffect(() => {
    loadDepartments();
  }, [page, type]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadDepartments();
  };

  return (
    <div className="p-10">
<div className="flex justify-between items-center mb-6">
  <h1 className="text-3xl font-bold">All Departments</h1>

  <button
    onClick={() => router.push("/admin/departments/create")}
    className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700"
  >
    + Create Department
  </button>
</div>

      {/* Search and Filter */}
      <form className="flex gap-4 mb-6" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by department name"
          className="border p-2 rounded w-96"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Engineering">Engineering</option>
          <option value="Science">Science</option>
          <option value="UG">UG</option>
          <option value="PG">PG</option>
          <option value="Research">Research</option>
        </select>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      {/* Table */}
      <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Department Name</th>
            <th className="p-3">Type</th>
            <th className="p-3">Number of Users</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {departments.map((d) => (
            <tr key={d._id} className="border-b">
              <td className="p-3">{d.name}</td>
              <td className="p-3">{d.type}</td>
              <td className="p-3">{d.userCount}</td>
              <td className="p-3 flex gap-3">
<button
  onClick={() => router.push(`/admin/departments/${d._id}/edit`)}
  className="bg-green-600 text-white px-3 py-1 rounded"
>
  Edit
</button>
<button
  className="text-red-600"
  onClick={() => deleteDepartment(d._id)}
>
  Delete
</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className={`px-4 py-2 rounded ${page <= 1 ? "bg-gray-300" : "bg-blue-600 text-white"}`}
        >
          Previous
        </button>

        <span className="text-lg font-semibold">
          Page {page} of {pages}
        </span>

        <button
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
          className={`px-4 py-2 rounded ${page >= pages ? "bg-gray-300" : "bg-blue-600 text-white"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
