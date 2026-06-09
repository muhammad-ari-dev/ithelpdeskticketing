export type UserRole = 'ADMIN' | 'HEAD_IT' | 'STAFF_IT_LEADER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketStatus = 'WAITING' | 'ON_CHECKING' | 'IN_PROGRESS' | 'COMPLETED' | 'REOPEN';

export interface Ticket {
    id: string;
    taskNo: string;
    description: string;
    priority: TicketPriority;
    status: TicketStatus;
    date: string;
    technicianName: string;
    clientName?: string;
    deadline?: string;
}