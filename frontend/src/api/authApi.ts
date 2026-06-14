import axiosClient from "./axiosClient";

export const authApi = {
  // 1. LOGIN
  login: async (data: { userName: string; password: string }) => {
    const response = await axiosClient.post("/api/auth/login", data);
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosClient.get("/api/employee/profile"); 
    return response.data;
  },

  // 2. REGISTRASI (Tambah Karyawan)
  registerEmployee: async (data: {
    employeeName: string;
    userName: string;
    email: string;
    noHp: string;
    roleName: string;
    leadID?: string | null;
  }) => {
    const response = await axiosClient.post("/api/employee/register", data);
    return response.data;
  },

  // 3. AMBIL DAFTAR LEAD (Untuk Dropdown di TambahUser)
  getLeads: async () => {
    const response = await axiosClient.get("/api/employee/leads");
    return response.data;
  },

  // 4. SET PASSWORD (Aktivasi Akun via Magic Link)
  setPassword: async (data: {
    magicToken: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const response = await axiosClient.post("/api/auth/set-password", data);
    return response.data;
  },
};
