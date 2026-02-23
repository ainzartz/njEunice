'use client';

import { useState, useEffect } from 'react';

interface UserInfo {
  email: string;
  firstName: string;
  lastName: string;
}

interface Message {
  id: string;
  content: string;
  isInbound: boolean;
  createdAt: string;
  user: UserInfo;
}

export default function MessageLog() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 uppercase tracking-widest text-sm font-bold">Loading message log...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 border border-red-100 flex items-center justify-between">
        <span className="font-semibold">{error}</span>
        <button onClick={fetchMessages} className="text-sm font-bold uppercase tracking-wider underline hover:text-red-800">Retry</button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-black w-48">Date / Time</th>
              <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-black w-24 text-center">Type</th>
              <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-black w-64">User Details</th>
              <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-black">Message Content</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {messages.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-500 uppercase tracking-widest text-sm">
                  No messages found in the log.
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap align-top">
                    {formatDate(message.createdAt)}
                  </td>
                  <td className="py-4 px-6 align-top text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${message.isInbound
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {message.isInbound ? 'Inbound' : 'Outbound'}
                    </span>
                  </td>
                  <td className="py-4 px-6 align-top">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{message.user.firstName} {message.user.lastName}</span>
                      <span className="text-sm text-gray-500">{message.user.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700 align-top whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
