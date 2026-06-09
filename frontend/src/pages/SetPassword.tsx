import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // Nangkep token dari URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.setPassword({
        magicToken: token || "",
        newPassword: password,
        confirmPassword: confirmPassword,
      });
      alert("Password berhasil diset! Silakan login.");
      navigate("/login");
    } catch (error: any) {
      alert(error.response?.data || "Gagal set password!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form
        onSubmit={handleSetPassword}
        className="p-8 bg-white shadow-lg rounded-2xl"
      >
        <h2 className="text-xl font-bold mb-4">Set Password Baru</h2>
        <input
          type="password"
          placeholder="Password Baru"
          className="w-full p-2 border mb-3 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Konfirmasi Password"
          className="w-full p-2 border mb-3 rounded"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Aktifkan Akun
        </button>
      </form>
    </div>
  );
}
