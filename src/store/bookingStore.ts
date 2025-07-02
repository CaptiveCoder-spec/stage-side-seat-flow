
import { create } from 'zustand';

export type SeatStatus = 'available' | 'booked' | 'blocked' | 'bms-booked';
export type ShowTime = 'Morning' | 'Matinee' | 'Evening' | 'Night';

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  section: string;
}

export interface SeatSection {
  name: string;
  price?: string;
  rows: Seat[][];
}

export interface BookingState {
  selectedDate: string;
  selectedShow: ShowTime;
  sections: SeatSection[];
  bookingHistory: Array<{
    date: string;
    show: ShowTime;
    sections: SeatSection[];
    timestamp: string;
  }>;
  
  // Actions
  setSelectedDate: (date: string) => void;
  setSelectedShow: (show: ShowTime) => void;
  toggleSeatStatus: (seatId: string, newStatus: SeatStatus) => void;
  saveBooking: () => void;
  loadBookingForDate: (date: string, show: ShowTime) => void;
  initializeSeats: () => void;
  getBookingStats: () => {
    total: number;
    available: number;
    booked: number;
    blocked: number;
    bmsBooked: number;
  };
}

// Create the exact layout from the image
const createSeatLayout = (): SeatSection[] => {
  const sections: SeatSection[] = [];

  // BOX Section - 3 rows (A-C), 6 seats each, all disabled
  const boxSeats: Seat[][] = [];
  ['A', 'B', 'C'].forEach(row => {
    const rowSeats: Seat[] = [];
    for (let i = 1; i <= 6; i++) {
      rowSeats.push({
        id: `BOX-${row}${i}`,
        row,
        number: i,
        status: 'blocked',
        section: 'BOX'
      });
    }
    boxSeats.push(rowSeats);
  });
  sections.push({ name: 'BOX', rows: boxSeats });

  // Rs. 150 STAR CLASS - 4 rows, varying seat counts
  const starSeats: Seat[][] = [];
  const starRowSeats = { A: 26, B: 26, C: 26, D: 18 };
  Object.entries(starRowSeats).forEach(([row, seatCount]) => {
    const rowSeats: Seat[] = [];
    for (let i = 1; i <= seatCount; i++) {
      rowSeats.push({
        id: `STAR-${row}${i}`,
        row,
        number: i,
        status: 'available',
        section: 'STAR'
      });
    }
    starSeats.push(rowSeats);
  });
  sections.push({ name: 'Rs. 150 STAR CLASS', rows: starSeats });

  // Rs. 120 CLASSIC BALCONY - 8 rows (A-H), 24 seats each with aisle
  const classicSeats: Seat[][] = [];
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(row => {
    const rowSeats: Seat[] = [];
    // First block: seats 1-12
    for (let i = 1; i <= 12; i++) {
      rowSeats.push({
        id: `CLASSIC-${row}${i}`,
        row,
        number: i,
        status: ['A', 'B'].includes(row) ? 'blocked' : 'available',
        section: 'CLASSIC'
      });
    }
    // Add aisle marker
    rowSeats.push({
      id: `CLASSIC-${row}-AISLE`,
      row,
      number: 0,
      status: 'blocked',
      section: 'CLASSIC'
    });
    // Second block: seats 13-24
    for (let i = 13; i <= 24; i++) {
      rowSeats.push({
        id: `CLASSIC-${row}${i}`,
        row,
        number: i,
        status: ['A', 'B'].includes(row) ? 'blocked' : 'available',
        section: 'CLASSIC'
      });
    }
    classicSeats.push(rowSeats);
  });
  sections.push({ name: 'Rs. 120 CLASSIC BALCONY', rows: classicSeats });

  // FIRST CLASS - 7 rows (A-G), 24 seats each, all disabled
  const firstClassSeats: Seat[][] = [];
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(row => {
    const rowSeats: Seat[] = [];
    for (let i = 1; i <= 24; i++) {
      rowSeats.push({
        id: `FIRST-${row}${i}`,
        row,
        number: i,
        status: 'blocked',
        section: 'FIRST'
      });
    }
    firstClassSeats.push(rowSeats);
  });
  sections.push({ name: 'FIRST CLASS', rows: firstClassSeats });

  // SECOND CLASS - 2 rows (A-B), 30 seats each, all disabled
  const secondClassSeats: Seat[][] = [];
  ['A', 'B'].forEach(row => {
    const rowSeats: Seat[] = [];
    for (let i = 1; i <= 30; i++) {
      rowSeats.push({
        id: `SECOND-${row}${i}`,
        row,
        number: i,
        status: 'blocked',
        section: 'SECOND'
      });
    }
    secondClassSeats.push(rowSeats);
  });
  sections.push({ name: 'SECOND CLASS', rows: secondClassSeats });

  return sections;
};

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  selectedShow: 'Evening',
  sections: createSeatLayout(),
  bookingHistory: [],

  setSelectedDate: (date) => set({ selectedDate: date }),
  
  setSelectedShow: (show) => set({ selectedShow: show }),
  
  toggleSeatStatus: (seatId, newStatus) => set((state) => ({
    sections: state.sections.map(section => ({
      ...section,
      rows: section.rows.map(row =>
        row.map(seat =>
          seat.id === seatId ? { ...seat, status: newStatus } : seat
        )
      )
    }))
  })),
  
  saveBooking: () => set((state) => ({
    bookingHistory: [
      ...state.bookingHistory,
      {
        date: state.selectedDate,
        show: state.selectedShow,
        sections: JSON.parse(JSON.stringify(state.sections)),
        timestamp: new Date().toISOString()
      }
    ]
  })),
  
  loadBookingForDate: (date, show) => {
    const state = get();
    const booking = state.bookingHistory.find(
      b => b.date === date && b.show === show
    );
    
    if (booking) {
      set({
        selectedDate: date,
        selectedShow: show,
        sections: JSON.parse(JSON.stringify(booking.sections))
      });
    } else {
      set({
        selectedDate: date,
        selectedShow: show,
        sections: createSeatLayout()
      });
    }
  },
  
  initializeSeats: () => set({ sections: createSeatLayout() }),
  
  getBookingStats: () => {
    const { sections } = get();
    const allSeats = sections.flatMap(section => 
      section.rows.flatMap(row => row.filter(seat => seat.number !== 0))
    );
    
    return {
      total: allSeats.length,
      available: allSeats.filter(s => s.status === 'available').length,
      booked: allSeats.filter(s => s.status === 'booked').length,
      blocked: allSeats.filter(s => s.status === 'blocked').length,
      bmsBooked: allSeats.filter(s => s.status === 'bms-booked').length,
    };
  }
}));
