/**
 * @file ticketUtils.ts
 * @description Kumpulan fungsi utilitas (helper) untuk mengelola logika tiket, 
 * khususnya untuk perhitungan prioritas dinamis, bobot pengurutan (sorting), 
 * dan penentuan gaya (style) lencana prioritas pada antarmuka pengguna.
 */

/**
 * Menghitung tingkat prioritas tiket secara dinamis berdasarkan sisa waktu (deadline).
 * 
 * Logika Perhitungan:
 * - Jika status tiket sudah 'Completed' (Selesai), maka sisa waktu dihitung 
 *   berdasarkan titik waktu saat tiket tersebut diselesaikan (`completedAt`), bukan waktu saat ini.
 * - Sisa Waktu <= 1 Hari (atau sudah terlambat) -> Prioritas HIGH
 * - Sisa Waktu > 1 Hari s/d 5 Hari -> Prioritas MEDIUM
 * - Sisa Waktu > 5 Hari -> Prioritas LOW
 * 
 * @param {string} dateStr - Tanggal jatuh tempo (deadline) tiket dalam format "DD/MM/YYYY HH:mm".
 * @param {string} [status] - (Opsional) Status tiket saat ini, misalnya 'Completed', 'In Progress', dll.
 * @param {string} [completedAt] - (Opsional) Timestamp ISO kapan tiket tersebut diselesaikan.
 * @param {boolean} [isReopened] - (Opsional) Apakah tiket ini merupakan tiket yang telah direopen.
 * @returns {'HIGH' | 'MEDIUM' | 'LOW'} Tingkat prioritas yang dihasilkan.
 */
export const calculateDynamicPriority = (dateStr: string, status?: string, completedAt?: string, isReopened?: boolean) => {
    // Kembalikan nilai bawaan (LOW) jika tidak ada tanggal jatuh tempo yang diberikan
    if (!dateStr) return 'LOW';
    
    // Memecah string tanggal dan waktu dari format "DD/MM/YYYY HH:mm"
    const parts = dateStr.split(' ');
    const dateParts = parts[0].split('/');
    
    // Berikan nilai default '00:00' jika bagian waktu tidak tersedia
    const timeParts = parts[1] ? parts[1].split(':') : ['00', '00'];
    
    // Validasi dasar, pastikan format tanggal memiliki bagian Hari, Bulan, dan Tahun
    if (dateParts.length !== 3) return 'LOW';
    
    // Membuat objek Date untuk target jatuh tempo (deadline)
    // Perlu diingat: Index bulan pada JavaScript Date dimulai dari 0 (Januari = 0)
    const targetDate = new Date(
        Number(dateParts[2]),    // Tahun
        Number(dateParts[1]) - 1, // Bulan
        Number(dateParts[0]),    // Hari
        Number(timeParts[0]),    // Jam
        Number(timeParts[1])     // Menit
    );
    
    // Menentukan waktu pembanding (waktu saat ini atau waktu saat tiket diselesaikan)
    let compareDate = new Date();
    
    // Jika tiket sudah diselesaikan (Completed) atau sedang direopen (isReopened) dan memiliki data waktu selesai, 
    // bekukan perhitungan menggunakan waktu selesai tersebut agar prioritas tidak berubah.
    if ((status === 'Completed' || isReopened) && completedAt) {
        compareDate = new Date(completedAt);
    }
    
    // Menghitung selisih waktu dalam milidetik, lalu mengonversinya menjadi pembulatan ke atas (H-Hari)
    const diffMs = targetDate.getTime() - compareDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    // Menentukan status berdasarkan aturan sisa hari
    if (diffDays <= 1) {
        return 'HIGH';   // Sisa waktu 1 hari atau sudah kedaluwarsa (overdue)
    } else if (diffDays <= 5) {
        return 'MEDIUM'; // Sisa waktu antara 2 hingga 5 hari
    } else {
        return 'LOW';    // Sisa waktu masih lebih dari 5 hari
    }
};

/**
 * Mendapatkan nilai bobot numerik dari sebuah prioritas untuk keperluan pengurutan (sorting).
 * Semakin tinggi nilainya, semakin tinggi prioritas tiket tersebut untuk ditampilkan di urutan atas.
 * 
 * @param {string} priority - Tingkat prioritas hasil kalkulasi (HIGH, MEDIUM, LOW).
 * @param {string} [status] - (Opsional) Status tiket saat ini.
 * @returns {number} Nilai bobot numerik (0-3).
 */
export const getPriorityWeight = (priority: string, status?: string) => {
    // Tiket yang sudah selesai ('Completed') selalu diberi bobot terendah (0) 
    // agar selalu berada di urutan paling bawah pada antrean.
    if (status === 'Completed') return 0; 

    // Konversi ke huruf besar (Uppercase) untuk menghindari kesalahan penulisan (case-sensitive)
    switch (priority.toUpperCase()) {
        case 'HIGH': return 3;
        case 'MEDIUM': return 2;
        case 'LOW': return 1;
        default: return 0;
    }
};

/**
 * Mengembalikan susunan class CSS Tailwind untuk pewarnaan lencana (badge) prioritas
 * pada antarmuka pengguna agar terlihat rapi dan seragam.
 * 
 * @param {string} priority - Tingkat prioritas (HIGH, MEDIUM, LOW).
 * @param {string} [status] - (Opsional) Status tiket saat ini.
 * @returns {string} Susunan class CSS Tailwind.
 */
export const getPriorityBadgeStyle = (priority: string, status?: string) => {
    // Jika tiket sudah berstatus selesai, berikan warna abu-abu netral 
    // untuk menandakan bahwa tiket sudah tidak aktif.
    if (status === 'Completed') {
        return 'bg-slate-100 text-slate-500 border-transparent shadow-none';
    }

    // Pewarnaan lencana untuk tiket yang masih aktif
    switch (priority.toUpperCase()) {
        case 'LOW': 
            return 'bg-[#22c55e] text-white border-transparent shadow-[0_4px_10px_rgba(34,197,94,0.3)]';
        case 'MEDIUM':
            return 'bg-[#f59e0b] text-white border-transparent shadow-[0_4px_10px_rgba(245,158,11,0.3)]';
        case 'HIGH': 
            return 'bg-[#ef4444] text-white border-transparent shadow-[0_4px_10px_rgba(239,68,68,0.3)]';
        default: 
            return 'bg-slate-200 text-slate-600 border-transparent';
    }
};
