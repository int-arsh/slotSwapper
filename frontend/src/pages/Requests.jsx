import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Requests = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [incomingResponse, outgoingResponse] = await Promise.all([
        axiosInstance.get('/swap-requests/incoming'),
        axiosInstance.get('/swap-requests/outgoing'),
      ]);
      setIncomingRequests(incomingResponse.data);
      setOutgoingRequests(outgoingResponse.data);
      setError('');
    } catch (err) {
      setError('Failed to load requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSwapResponse = async (requestId, accept) => {
    try {
      await axiosInstance.post(`/swap-response/${requestId}`, { accept });
      setSuccess(accept ? 'Swap accepted!' : 'Swap rejected.');
      fetchRequests();
      setTimeout(() => {
        setSuccess('');
        navigate('/dashboard'); // Refresh dashboard to see updated events
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process swap response.');
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

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Swap Requests</h1>

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
          <div className="text-center py-8">Loading requests...</div>
        ) : (
          <>
            {/* Incoming Requests */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Incoming Requests</h2>
              {incomingRequests.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                  No incoming swap requests.
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingRequests.map((request) => (
                    <div key={request.id} className="bg-white p-4 rounded-lg shadow-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">Request from User #{request.requester_id}</p>
                          <p className="text-sm text-gray-600">
                            Wants to swap their slot (ID: {request.my_slot_id}) with yours (ID: {request.their_slot_id})
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      {request.status === 'PENDING' && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleSwapResponse(request.id, true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleSwapResponse(request.id, false)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Requests */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Outgoing Requests</h2>
              {outgoingRequests.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                  No outgoing swap requests.
                </div>
              ) : (
                <div className="space-y-4">
                  {outgoingRequests.map((request) => (
                    <div key={request.id} className="bg-white p-4 rounded-lg shadow-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Request to User #{request.receiver_id}</p>
                          <p className="text-sm text-gray-600">
                            Your slot (ID: {request.my_slot_id}) for their slot (ID: {request.their_slot_id})
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Requests;

