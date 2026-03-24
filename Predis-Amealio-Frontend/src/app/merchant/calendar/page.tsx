'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, Instagram, Facebook, Linkedin } from 'lucide-react';
import { contentApi, ContentItem } from '@/lib/api/content';

export default function CalendarPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScheduled() {
      try {
        setLoading(true);
        const response = await contentApi.getContent('scheduled');
        setItems(response.data || []);
      } catch (error) {
        console.error('Failed to load scheduled content:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadScheduled();
  }, []);

  const getPlatformIcon = (platform?: string) => {
    if (!platform) return null;
    const lower = platform.toLowerCase();
    if (lower === 'instagram') return <Instagram className="w-3 h-3" />;
    if (lower === 'facebook') return <Facebook className="w-3 h-3" />;
    if (lower === 'linkedin') return <Linkedin className="w-3 h-3" />;
    return null;
  };

  const groupedByDate = items.reduce<Record<string, ContentItem[]>>((acc, item) => {
    const key = item.scheduledAt
      ? new Date(item.scheduledAt).toDateString()
      : new Date(item.createdAt).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Content Calendar</h1>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Loading scheduled content...
              </div>
            ) : items.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-sm">
                <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-60" />
                <p className="font-medium mb-1">No scheduled posts yet</p>
                <p className="text-xs">Use the Schedule button from your Content Library to add posts here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((dateKey) => (
                  <div key={dateKey} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{new Date(dateKey).toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-2">
                      {groupedByDate[dateKey].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 text-xs gap-4"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {item.platform && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                                  {getPlatformIcon(item.platform)}
                                  <span>{item.platform}</span>
                                </span>
                              )}
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                                {item.type.toUpperCase()}
                              </span>
                            </div>
                            <p className="max-w-xl truncate text-gray-800">
                              {item.prompt || item.generatedText || 'Scheduled content'}
                            </p>
                          </div>

                          <div className="flex items-center justify-end gap-1 text-[11px] text-gray-500 flex-shrink-0">
                            {item.scheduledAt && (
                              <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 whitespace-nowrap">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {new Date(item.scheduledAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
