import axiosClient from "./axiosClient";

export interface TicketCreateRequest {
  ticketName: string;
  ticketDesc: string;
  deadline: string; // Will format as ISO or backend-expected string
  assignedEmployeeId?: string | null;
}

export interface TicketResponse {
  id: string | number;
  ticketCode: string;
  ticketName: string;
  ticketDesc: string;
  status: string;
  deadline: string;
  assignedEmployeeId?: string | null;
  assignedEmployeeName?: string | null;
  extraNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const ticketApi = {
  // 1. CREATE TICKET (LEAD / Kepala IT / Atasan)
  createTicket: async (data: FormData): Promise<any> => {
    const response = await axiosClient.post("/api/ticket/create", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 2. DASHBOARD MONITORING (LEAD) - Get all tickets to filter for "On Check"
  getAllTickets: async (): Promise<any> => {
    const response = await axiosClient.get("/api/ticket");
    return response.data;
  },

  // 3. APPROVE TICKET (LEAD)
  approveTicket: async (ticketCode: string, extraNote: string): Promise<any> => {
    const response = await axiosClient.put(`/api/ticket/approve/${ticketCode}`, { extraNote });
    return response.data;
  },

  // 4. REJECT TICKET (LEAD)
  rejectTicket: async (ticketCode: string, extraNote: string): Promise<any> => {
    const response = await axiosClient.put(`/api/ticket/reject/${ticketCode}`, { extraNote });
    return response.data;
  },

  // 5. EMPLOYEE TICKET LIST (GET /my-tickets)
  getMyTickets: async (): Promise<any> => {
    const response = await axiosClient.get("/api/ticket/my-tickets");
    return response.data;
  },

  // 6. START WORK (EMPLOYEE - open or reopen status -> start)
  startTicket: async (ticketCode: string): Promise<any> => {
    const response = await axiosClient.put(`/api/ticket/start/${ticketCode}`);
    return response.data;
  },

  // 7. SUBMIT FOR VALIDATION (EMPLOYEE - on progress -> submit check)
  submitCheckTicket: async (ticketCode: string, extraNote: string): Promise<any> => {
    const response = await axiosClient.put(`/api/ticket/submit-check/${ticketCode}`, { extraNote });
    return response.data;
  },
};
