import { useState, useEffect } from 'react';
import { Activity, UserPlus, FileText, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';

const ActivityTimeline = ({ projectId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchActivities = async () => {
    try {
      const endpoint = projectId 
        ? `/activities?project=${projectId}` 
        : '/activities';
      const response = await api.get(endpoint);
      setActivities(response.data.data || []);
    } catch {
      console.error('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_created':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'task_completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'task_updated':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'member_added':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'comment_added':
        return <MessageCircle className="w-5 h-5 text-pink-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => (
          <li key={activity._id}>
            <div className="relative pb-8">
              {idx !== activities.length - 1 && (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center ring-8 ring-white">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {activity.user?.name || 'Unknown User'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {activity.description}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityTimeline;
