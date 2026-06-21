import axiosClient from "./axiosClient";

export const authApi = {
  // LOGIN
  login: async (data: { userName: string; password: string }) => {
    const response = await axiosClient.post("/api/auth/login", data);
    return response.data;
  },

   // SET PASSWORD (Aktivasi Akun via Magic Link)
  setPassword: async (data: {
    magicToken: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const response = await axiosClient.post("/api/auth/set-password", data);
    return response.data;
  },

  getEmployees: async () => {
    const response = await axiosClient.get("/api/employee/employees");
    return response.data;
  },

  editEmployee: async (data: {
    employeeId: string;
    employeeName: string;
    email: string;
    noHp: string;
    roleName: "ADMINISTRATOR" | "LEAD" | "EMPLOYEE";
    leadID?: string;
    staffIds?: string[];
  }) => {
    const response = await axiosClient.patch("/api/employee/edit-employee", data);
    return response.data;
  },

  resetPassword: async (data: { employeeId: string }) => {
    const response = await axiosClient.patch("/api/employee/reset-password", data);
    return response.data;
  },

  disableUser: async (data: { employeeId: string }) => {
    const response = await axiosClient.patch("/api/employee/disable", data);
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosClient.get("/api/employee/profile"); 
    return response.data;
  },

  // CHANGE PASSWORD (Ganti Password sendiri)
  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const response = await axiosClient.patch("/api/employee/change-password", data);
    return response.data;
  },

  // REGISTRASI (Tambah Karyawan)
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

  // AMBIL DAFTAR LEAD (Untuk Dropdown di TambahUser)
  getLeads: async () => {
    const response = await axiosClient.get("/api/employee/leads");
    return response.data;
  },

  getTickets: async () => {
    const response = await axiosClient.get("/api/ticket/tickets");
    return response.data;
  },

  getTicket: async (ticketCode: string) => {
    const response = await axiosClient.get(`/api/ticket/ticket/${ticketCode}`);
    return response.data;
  },

  approveTicket: async (ticketCode: string, extraNote: string) => {
    const response = await axiosClient.put(`/api/ticket/approve/${ticketCode}`, { extraNote });
    return response.data;
  },

  rejectTicket: async (ticketCode: string, extraNote: string) => {
    const response = await axiosClient.put(`/api/ticket/reject/${ticketCode}`, { extraNote });
    return response.data;
  },

  getMyTickets: async () => {
    const response = await axiosClient.get("/api/ticket/my-tickets");
    return response.data;
  },

  startTicket: async (ticketCode: string) => {
    const response = await axiosClient.put(`/api/ticket/start/${ticketCode}`);
    return response.data;
  },

  submitToCheck: async (ticketCode: string, extraNote: string) => {
    const response = await axiosClient.put(`/api/ticket/submit-check/${ticketCode}`, { extraNote });
    return response.data;
  },
};
