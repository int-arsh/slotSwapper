const EventList = ({ events, onMakeSwappable, onDelete, showActions = true }) => {
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
      BUSY: 'bg-red-100 text-red-800',
      SWAPPABLE: 'bg-green-100 text-green-800',
      SWAP_PENDING: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No events found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <div key={event.id} className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            {getStatusBadge(event.status)}
          </div>
          <div className="text-sm text-gray-600 mb-4">
            <div>Start: {formatDateTime(event.start_time)}</div>
            <div>End: {formatDateTime(event.end_time)}</div>
          </div>
          {showActions && (
            <div className="flex gap-2">
              {event.status !== 'SWAPPABLE' && (
                <button
                  onClick={() => onMakeSwappable(event.id)}
                  className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Make Swappable
                </button>
              )}
              <button
                onClick={() => onDelete(event.id)}
                className="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventList;

