import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import EventList from '../components/EventList';

const Marketplace = () => {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const fetchSwappableSlots = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/swappable-slots');
      setSwappableSlots(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load swappable slots.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySwappableSlots = async () => {
    try {
      const response = await axiosInstance.get('/events');
      const swappable = response.data.filter((e) => e.status === 'SWAPPABLE');
      setMySwappableSlots(swappable);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSwappableSlots();
    fetchMySwappableSlots();
  }, []);

  const handleRequestSwap = (slot) => {
    setSelectedSlot(slot);
    fetchMySwappableSlots();
    if (mySwappableSlots.length === 0) {
      setError('You need at least one SWAPPABLE event to request a swap.');
      return;
    }
    setShowModal(true);
  };

  const handleConfirmSwap = async (mySlotId) => {
    try {
      await axiosInstance.post('/swap-request', {
        my_slot_id: mySlotId,
        their_slot_id: selectedSlot.id,
      });
      setSuccess('Swap request sent successfully!');
      setShowModal(false);
      setSelectedSlot(null);
      fetchSwappableSlots();
      fetchMySwappableSlots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send swap request.');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Marketplace</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading swappable slots...</div>
        ) : swappableSlots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No swappable slots available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {swappableSlots.map((slot) => (
              <div key={slot.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{slot.title}</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    SWAPPABLE
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <div>Start: {formatDateTime(slot.start_time)}</div>
                  <div>End: {formatDateTime(slot.end_time)}</div>
                </div>
                <button
                  onClick={() => handleRequestSwap(slot)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Request Swap
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Swap Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Select Your Slot to Swap</h2>
            <p className="text-sm text-gray-600 mb-4">
              You want to swap with: <strong>{selectedSlot?.title}</strong>
            </p>
            {mySwappableSlots.length === 0 ? (
              <div className="text-red-600 mb-4">
                You need at least one SWAPPABLE event to request a swap.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {mySwappableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleConfirmSwap(slot.id)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200"
                  >
                    <div className="font-semibold">{slot.title}</div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(slot.start_time)} - {formatDateTime(slot.end_time)}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedSlot(null);
              }}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;

