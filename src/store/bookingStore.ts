
import { create } from 'zustand';

export type SeatStatus = 'available' | 'booked' | 'blocked' | 'bms-booked' | 'disabled';
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
  rows: Array<{
    row: string;
    seats: number;
    startNumber?: number;
  }>;
  defaultStatus: SeatStatus;
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
  toggleSeatStatus: (seatId: string) => void;
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

// Define theater sections exactly as shown in the image
const seatSections: SeatSection[] = [
  {
    name: 'BOX',
    rows: [
      { row: 'A', seats: 6 },
      { row: 'B', seats: 6 },
      { row: 'C', seats: 6 }
    ],
    defaultStatus: 'disabled'
  },
  {
    name: 'Rs. 150 STAR CLASS',
    price: 'Rs. 150',
    rows: [
      { row: 'A', seats: 26 },
      { row: 'B', seats: 26 },
      { row: 'C', seats: 26 },
      { row: 'D', seats: 18 }
    ],
    defaultStatus: 'available'
  },
  {
    name: 'Rs. 120 CLASSIC BALCONY',
    price: 'Rs. 120',
    rows: [
      { row: 'A', seats: 24 },
      { row: 'B', seats: 24 },
      { row: 'C', seats: 24 },
      { row: 'D', seats: 24 },
      { row: 'E', seats: 24 },
      { row: 'F', seats: 24 },
      { row: 'G', seats: 24 },
      { row: 'H', seats: 24 }
    ],
    defaultStatus: 'available'
  },
  {
    name: 'FIRST CLASS',
    rows: [
      { row: 'A', seats: 24 },
      { row: 'B', seats: 24 },
      { row: 'C', seats: 24 },
      { row: 'D', seats: 24 },
      { row: 'E', seats: 24 },
      { row: 'F', seats: 24 },
      { row: 'G', seats: 24 }
    ],
    defaultStatus: 'disabled'
  },
  {
    name: 'SECOND CLASS',
    rows: [
      { row: 'A', seats: 30 },
      { row: 'B', seats: 30 }
    ],
    defaultStatus: 'disabled'
  }
];

// Create seats based on the defined sections
const createInitialSeats = (): Seat[] => {
  const seats: Seat[] = [];
  
  seatSections.forEach(section => {
    section.rows.forEach(({ row, seats: seatCount }) => {
      for (let i = 1; i <= seatCount; i++) {
        let status = section.defaultStatus;
        
        // Special cases for partially disabled rows
        if (section.name === 'Rs. 120 CLASSIC BALCONY' && (row === 'A' || row === 'B')) {
          status = i <= 12 ? 'disabled' : 'available';
        }
        
        seats.push({
          id: `${section.name}-${row}${i}`,
          row,
          number: i,
          status,
          section: section.name
        });
      });
    });
  });
  
  return seats;
};

const getNextStatus = (currentStatus: SeatStatus): SeatStatus => {
  if (currentStatus === 'disabled') return 'disabled';
  
  switch (currentStatus) {
    case 'available': return 'booked';
    case 'booked': return 'blocked';
    case 'blocked': return 'bms-booked';
    case 'bms-booked': return 'available';
    default: return 'available';
  }
};

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  selectedShow: 'Evening',
  seats: createInitialSeats(),
  bookingHistory: [],

  setSelectedDate: (date) => set({ selectedDate: date }),
  
  setSelectedShow: (show) => set({ selectedShow: show }),
  
  toggleSeatStatus: (seatId) => set((state) => ({
    seats: state.seats.map(seat =>
      seat.id === seatId ? { ...seat, status: getNextStatus(seat.status) } : seat
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
    const bookableSeats = seats.filter(s => s.status !== 'disabled');
    return {
      total: bookableSeats.length,
      available: bookableSeats.filter(s => s.status === 'available').length,
      booked: bookableSeats.filter(s => s.status === 'booked').length,
      blocked: bookableSeats.filter(s => s.status === 'blocked').length,
      bmsBooked: bookableSeats.filter(s => s.status === 'bms-booked').length,
    };
  }
}));

export { seatSections };
