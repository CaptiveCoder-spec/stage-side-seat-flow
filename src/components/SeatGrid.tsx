
import { useState } from 'react';
import { useBookingStore, SeatStatus, Seat } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';
import SectionHeader from './SectionHeader';

const SeatGrid = () => {
  const { sections, toggleSeatStatus } = useBookingStore();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const getSeatColor = (status: SeatStatus, isAisle: boolean = false) => {
    if (isAisle) return 'bg-transparent';
    
    switch (status) {
      case 'available': return 'bg-green-500 hover:bg-green-600 text-white border-green-600';
      case 'booked': return 'bg-red-500 hover:bg-red-600 text-white border-red-600';
      case 'blocked': return 'bg-gray-400 text-white border-gray-500 cursor-not-allowed';
      case 'bms-booked': return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600';
      default: return 'bg-gray-300 border-gray-400';
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
    if (seat.number === 0 || seat.status === 'blocked') return; // Skip aisle markers and blocked seats in BOX/FIRST/SECOND
    setSelectedSeat(seat.id);
  };

  const handleStatusChange = (newStatus: SeatStatus) => {
    if (selectedSeat) {
      toggleSeatStatus(selectedSeat, newStatus);
      setSelectedSeat(null);
    }
  };

  const cycleStatus = (currentStatus: SeatStatus): SeatStatus => {
    const statusCycle: SeatStatus[] = ['available', 'booked', 'blocked', 'bms-booked'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    return statusCycle[(currentIndex + 1) % statusCycle.length];
  };

  const handleSeatDoubleClick = (seat: Seat) => {
    if (seat.number === 0 || (seat.section === 'BOX' || seat.section === 'FIRST' || seat.section === 'SECOND')) return;
    const newStatus = cycleStatus(seat.status);
    toggleSeatStatus(seat.id, newStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Theatre Seat Layout</h3>
        <div className="text-sm text-gray-600">
          Multi-Class Seating
        </div>
      </div>

      {/* All Sections */}
      <div className="space-y-8">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <SectionHeader title={section.name} />
            
            {/* Seat Grid for this section */}
            <div className="space-y-2">
              {section.rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-center space-x-1">
                  <div className="w-8 text-center font-semibold text-gray-700">
                    {row[0]?.row}
                  </div>
                  <div className="flex space-x-1">
                    {row.map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        onDoubleClick={() => handleSeatDoubleClick(seat)}
                        disabled={seat.number === 0}
                        className={`
                          w-8 h-8 rounded text-xs font-medium border-2 transition-all flex items-center justify-center
                          ${getSeatColor(seat.status, seat.number === 0)}
                          ${selectedSeat === seat.id ? 'ring-4 ring-purple-300 scale-110' : ''}
                          ${seat.number === 0 ? 'w-4' : ''}
                        `}
                        title={seat.number === 0 ? 'Aisle' : `${seat.id} - ${seat.status}`}
                      >
                        {seat.number === 0 ? '' : seat.number}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Screen at the bottom */}
      <div className="mt-12 mb-8">
        <div className="bg-gray-800 text-white text-center py-4 rounded-lg">
          <span className="text-xl font-medium">🎬 SCREEN</span>
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">All eyes this way please!</p>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-600"></div>
          <span className="text-sm">Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-400 rounded border-2 border-gray-500"></div>
          <span className="text-sm">Blocked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-600"></div>
          <span className="text-sm">BMS Booked</span>
        </div>
      </div>

      {/* Quick Actions for Selected Seat */}
      {selectedSeat && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Selected: {selectedSeat}</span>
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
              Available
            </Button>
            <Button
              onClick={() => handleStatusChange('booked')}
              className="bg-red-500 hover:bg-red-600 text-xs py-1"
            >
              Book
            </Button>
            <Button
              onClick={() => handleStatusChange('blocked')}
              className="bg-yellow-500 hover:bg-yellow-600 text-xs py-1"
            >
              Block
            </Button>
            <Button
              onClick={() => handleStatusChange('bms-booked')}
              className="bg-blue-500 hover:bg-blue-600 text-xs py-1"
            >
              BMS
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatGrid;
