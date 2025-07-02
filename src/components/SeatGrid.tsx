
import { useBookingStore, seatSections } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';
import SectionHeader from './SectionHeader';

const SeatGrid = () => {
  const { seats, toggleSeatStatus } = useBookingStore();

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500 hover:bg-green-600 text-white border-green-600';
      case 'booked': return 'bg-red-500 hover:bg-red-600 text-white border-red-600';
      case 'blocked': return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600';
      case 'bms-booked': return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600';
      case 'disabled': return 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed';
      default: return 'bg-gray-300 border-gray-400';
    }
  };

  const handleSeatClick = (seatId: string, status: string) => {
    if (status !== 'disabled') {
      toggleSeatStatus(seatId);
    }
  };

  const renderSeatRow = (sectionName: string, rowLabel: string, rowSeats: any[]) => {
    const isBalcony = sectionName === 'Rs. 120 CLASSIC BALCONY';
    
    if (isBalcony) {
      // Split balcony seats into two blocks with aisle
      const leftBlock = rowSeats.slice(0, 12);
      const rightBlock = rowSeats.slice(12);
      
      return (
        <div key={`${sectionName}-${rowLabel}`} className="flex items-center justify-center space-x-8 mb-2">
          <div className="w-6 text-center font-bold text-gray-700">{rowLabel}</div>
          
          {/* Left block */}
          <div className="flex space-x-1">
            {leftBlock.map((seat) => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat.id, seat.status)}
                disabled={seat.status === 'disabled'}
                className={`w-7 h-7 text-xs font-medium border-2 rounded transition-all ${getSeatColor(seat.status)}`}
                title={`${seat.section} ${seat.row}${seat.number} - ${seat.status}`}
              >
                {seat.number}
              </button>
            ))}
          </div>
          
          {/* Aisle space */}
          <div className="w-8"></div>
          
          {/* Right block */}
          <div className="flex space-x-1">
            {rightBlock.map((seat) => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat.id, seat.status)}
                disabled={seat.status === 'disabled'}
                className={`w-7 h-7 text-xs font-medium border-2 rounded transition-all ${getSeatColor(seat.status)}`}
                title={`${seat.section} ${seat.row}${seat.number} - ${seat.status}`}
              >
                {seat.number}
              </button>
            ))}
          </div>
          
          <div className="w-6 text-center font-bold text-gray-700">{rowLabel}</div>
        </div>
      );
    } else {
      // Regular row layout
      return (
        <div key={`${sectionName}-${rowLabel}`} className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-6 text-center font-bold text-gray-700">{rowLabel}</div>
          <div className="flex space-x-1 justify-center">
            {rowSeats.map((seat) => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat.id, seat.status)}
                disabled={seat.status === 'disabled'}
                className={`w-7 h-7 text-xs font-medium border-2 rounded transition-all ${getSeatColor(seat.status)}`}
                title={`${seat.section} ${seat.row}${seat.number} - ${seat.status}`}
              >
                {seat.number}
              </button>
            ))}
          </div>
          <div className="w-6 text-center font-bold text-gray-700">{rowLabel}</div>
        </div>
      );
    }
  };

  const renderSection = (section: any) => {
    const sectionSeats = seats.filter(seat => seat.section === section.name);
    const seatsByRow = sectionSeats.reduce((acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    }, {} as Record<string, any[]>);

    // Sort rows alphabetically and seats numerically
    const sortedRows = Object.keys(seatsByRow).sort();
    sortedRows.forEach(row => {
      seatsByRow[row].sort((a, b) => a.number - b.number);
    });

    return (
      <div key={section.name} className="mb-8">
        <SectionHeader title={section.name} price={section.price} />
        <div className="space-y-1">
          {sortedRows.map(row => renderSeatRow(section.name, row, seatsByRow[row]))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-h-screen overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Theatre Seat Layout</h3>
        <div className="text-sm text-gray-600">
          Screen 1 • Kiosk Mode
        </div>
      </div>

      {/* Screen Indicator */}
      <div className="mb-8">
        <div className="bg-gray-800 text-white text-center py-4 rounded-lg mb-6 mx-auto max-w-md">
          <span className="text-xl font-bold">🎬 SCREEN</span>
        </div>
      </div>

      {/* Seat Sections */}
      <div className="space-y-6">
        {seatSections.map(section => renderSection(section))}
      </div>

      {/* Color Legend */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-semibold mb-4 text-center">Color Legend</h4>
        <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-green-500 rounded border-2 border-green-600"></div>
            <span className="text-xs font-medium">Available</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-red-500 rounded border-2 border-red-600"></div>
            <span className="text-xs font-medium">Booked</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-yellow-500 rounded border-2 border-yellow-600"></div>
            <span className="text-xs font-medium">VIP/Blocked</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-blue-500 rounded border-2 border-blue-600"></div>
            <span className="text-xs font-medium">BMS Online</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-gray-300 rounded border-2 border-gray-400"></div>
            <span className="text-xs font-medium">Reserved</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
        <p className="font-medium mb-1">Click seats to cycle through status:</p>
        <p>🟢 Available → 🔴 Booked → 🟡 Blocked → 🔵 BMS Online → 🟢</p>
      </div>
    </div>
  );
};

export default SeatGrid;
