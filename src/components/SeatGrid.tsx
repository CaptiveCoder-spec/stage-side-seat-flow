
import { useState } from 'react';
import { useBookingStore, SeatStatus, Seat } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';

const SeatGrid = () => {
  const { seats, toggleSeatStatus } = useBookingStore();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case 'available': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'booked': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'blocked': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'bms-booked': return 'bg-blue-500 hover:bg-blue-600 text-white';
      default: return 'bg-gray-300';
    }
  };

  const getSeatIcon = (status: SeatStatus) => {
    switch (status) {
      case 'available': return '✓';
      case 'booked': return '✗';
      case 'blocked': return '⚠';
      case 'bms-booked': return '🌐';
      default: return '';
    }
  };

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat.id);
  };

  const handleStatusChange = (newStatus: SeatStatus) => {
    if (selectedSeat) {
      toggleSeatStatus(selectedSeat, newStatus);
      setSelectedSeat(null);
    }
  };

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Seat Selection</h3>
        <div className="text-sm text-gray-600">
          Screen 1 • Total: {seats.length} seats
        </div>
      </div>

      {/* Screen Indicator */}
      <div className="mb-8">
        <div className="bg-gray-800 text-white text-center py-3 rounded-lg mb-4">
          <span className="text-lg font-medium">🎬 SCREEN</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="space-y-3 mb-6">
        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
          <div key={row} className="flex items-center justify-center space-x-2">
            <div className="w-8 text-center font-semibold text-gray-700">
              {row}
            </div>
            <div className="flex space-x-1">
              {rowSeats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  className={`
                    w-12 h-12 rounded-lg font-medium text-sm border-2 transition-all
                    ${getSeatColor(seat.status)}
                    ${selectedSeat === seat.id ? 'ring-4 ring-purple-300 scale-110' : ''}
                  `}
                  title={`${seat.id} - ${seat.status}`}
                >
                  <div className="text-xs">{seat.number}</div>
                  <div className="text-xs">{getSeatIcon(seat.status)}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Blocked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm">BMS Booked</span>
        </div>
      </div>

      {/* Quick Actions for Selected Seat */}
      {selectedSeat && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Selected: Seat {selectedSeat}</span>
            <button
              onClick={() => setSelectedSeat(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={() => handleStatusChange('available')}
              className="bg-green-500 hover:bg-green-600 text-xs py-1"
            >
              Make Available
            </Button>
            <Button
              onClick={() => handleStatusChange('booked')}
              className="bg-red-500 hover:bg-red-600 text-xs py-1"
            >
              Book Seat
            </Button>
            <Button
              onClick={() => handleStatusChange('blocked')}
              className="bg-yellow-500 hover:bg-yellow-600 text-xs py-1"
            >
              Block Seat
            </Button>
            <Button
              onClick={() => handleStatusChange('bms-booked')}
              className="bg-blue-500 hover:bg-blue-600 text-xs py-1"
            >
              Mark BMS
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatGrid;
