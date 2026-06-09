import { createContext, useState, useContext, ReactNode } from 'react';

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    // Data user yang diinput dari halaman Tambah User
    const [users, setUsers] = useState([
        { id: 1, name: 'Fadlan Jamirudin', role: 'Staff IT', avatar: 'https://i.pravatar.cc/150?img=15' },
        // ... user lainnya
    ]);

    return (
        <AppContext.Provider value={{ users, setUsers }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);