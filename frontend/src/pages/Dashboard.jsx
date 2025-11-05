import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import EventForm from '../components/EventForm';
import EventList from '../components/EventList';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/events/');
      setEvents(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load events. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (eventData) => {
    try {
      await axiosInstance.post('/events/', eventData);
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create event.');
    }
  };

  const handleMakeSwappable = async (eventId) => {
    try {
      await axiosInstance.put(`/events/${eventId}`, { status: 'SWAPPABLE' });
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update event.');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      await axiosInstance.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete event.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Event'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <EventForm onSubmit={handleCreateEvent} onCancel={() => setShowForm(false)} />
        )}

        {loading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : (
          <EventList
            events={events}
            onMakeSwappable={handleMakeSwappable}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

