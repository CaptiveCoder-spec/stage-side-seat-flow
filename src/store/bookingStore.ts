
import { create } from 'zustand';

export type SeatStatus = 'available' | 'booked' | 'blocked' | 'bms-booked';
export type ShowTime = 'Morning' | 'Matinee' | 'Evening' | 'Night';

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
}

export interface BookingState {
  selectedDate: string;
  selectedShow: ShowTime;
  seats: Seat[];
  bookingHistory: Array<{
    date: string;
    show: ShowTime;
    seats: Seat[];
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

// Initialize default seat layout (5 rows x 10 columns)
const createInitialSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E'];
  
  rows.forEach(row => {
    for (let i = 1; i <= 10; i++) {
      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        status: 'available'
      });
    }
  });
  
  return seats;
};

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  selectedShow: 'Evening',
  seats: createInitialSeats(),
  bookingHistory: [],

  setSelectedDate: (date) => set({ selectedDate: date }),
  
  setSelectedShow: (show) => set({ selectedShow: show }),
  
  toggleSeatStatus: (seatId, newStatus) => set((state) => ({
    seats: state.seats.map(seat =>
      seat.id === seatId ? { ...seat, status: newStatus } : seat
    )
  })),
  
  saveBooking: () => set((state) => ({
    bookingHistory: [
      ...state.bookingHistory,
      {
        date: state.selectedDate,
        show: state.selectedShow,
        seats: [...state.seats],
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
        seats: [...booking.seats]
      });
    } else {
      set({
        selectedDate: date,
        selectedShow: show,
        seats: createInitialSeats()
      });
    }
  },
  
  initializeSeats: () => set({ seats: createInitialSeats() }),
  
  getBookingStats: () => {
    const { seats } = get();
    return {
      total: seats.length,
      available: seats.filter(s => s.status === 'available').length,
      booked: seats.filter(s => s.status === 'booked').length,
      blocked: seats.filter(s => s.status === 'blocked').length,
      bmsBooked: seats.filter(s => s.status === 'bms-booked').length,
    };
  }
}));
