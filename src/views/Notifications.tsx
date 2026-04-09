"use client";

import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Bell, Briefcase, Wallet, AlertCircle, MessageCircle, Check } from 'lucide-react';

export default function Notifications() {
  const { notifications, markNotificationAsRead } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string, read: boolean) => {
    const iconClass = read ? 'text-stone-400' : 'text-stone-700';
    switch (type) {
      case 'job':
        return <Briefcase className={iconClass} size={24} />;
      case 'payment':
        return <Wallet className={iconClass} size={24} />;
      case 'system':
        return <AlertCircle className={iconClass} size={24} />;
      default:
        return <Bell className={iconClass} size={24} />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'job':
        return <Badge variant="info" size="sm">Job</Badge>;
      case 'payment':
        return <Badge variant="success" size="sm">Payment</Badge>;
      case 'system':
        return <Badge variant="default" size="sm">System</Badge>;
      default:
        return <Badge size="sm">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Notifications</h1>
          <p className="text-stone-600 mt-1">
            Stay updated with your jobs and payments
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="danger">{unreadCount} Unread</Badge>
        )}
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-600">
        <CardContent className="flex items-center gap-3 py-4">
          <MessageCircle className="text-green-700" size={24} />
          <div>
            <h3 className="font-semibold text-stone-900">WhatsApp Alerts Enabled</h3>
            <p className="text-sm text-stone-700">
              You'll also receive important notifications via WhatsApp
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Bell className="mx-auto text-stone-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-stone-900 mb-2">No Notifications</h3>
              <p className="text-stone-600">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map(notification => (
            <Card
              key={notification.id}
              className={`transition-all ${
                !notification.read
                  ? 'border-l-4 border-l-amber-600 bg-amber-50/30'
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg flex-shrink-0 ${
                      !notification.read ? 'bg-stone-100' : 'bg-stone-50'
                    }`}
                  >
                    {getIcon(notification.type, notification.read)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-semibold ${
                            !notification.read ? 'text-stone-900' : 'text-stone-700'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {getTypeBadge(notification.type)}
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-amber-600 flex-shrink-0 mt-1" />
                      )}
                    </div>

                    <p
                      className={`text-sm mb-2 ${
                        !notification.read ? 'text-stone-700' : 'text-stone-600'
                      }`}
                    >
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-stone-500">
                        {formatDate(notification.date)}
                      </p>

                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="flex items-center gap-1"
                        >
                          <Check size={14} />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <Card className="bg-stone-50">
          <CardContent className="text-center py-8">
            <p className="text-stone-600 text-sm">
              Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
