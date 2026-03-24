'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, Trash2, Edit3, Clock } from 'lucide-react';
import { contentApi, ContentItem } from '@/lib/api/content';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as DateCalendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { TimePickerCompact } from '@/components/ui/time-picker-compact';

const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return '';
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const display12h = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${String(display12h).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

export default function ContentLibraryPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  const [scheduleTime, setScheduleTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchContent(1, false);
  }, []);

  const fetchContent = async (targetPage: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await contentApi.getContent('all', targetPage, 12);
      setHasMore(response.data.length === 12);
      setPage(targetPage);

      setContentItems((prev) =>
        append ? [...prev, ...response.data] : response.data,
      );
    } catch (error: any) {
      console.error('Failed to fetch content:', error);
      console.error('Error details:', error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push('/merchant/create');
  };

  const handleView = (item: ContentItem) => {
    setSelectedItem(item);
    setViewOpen(true);
  };

  const handleScheduleClick = (item: ContentItem) => {
    setSelectedItem(item);
    setScheduleDate(new Date());
    setScheduleTime('');
    setScheduleOpen(true);
  };

  const handleDeleteClick = (item: ContentItem) => {
    setSelectedItem(item);
    setDeleteOpen(true);
  };

  const handleEdit = (item: ContentItem) => {
    router.push(`/merchant/create?id=${item.id}`);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      setActionLoading(true);
      await contentApi.deleteContent(selectedItem.id);
      setContentItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setDeleteOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to delete content:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmSchedule = async () => {
    if (!selectedItem || !scheduleDate || !scheduleTime) return;

    try {
      setActionLoading(true);

      const [hours, minutes] = scheduleTime.split(':').map(Number);
      const scheduledAt = new Date(scheduleDate);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        scheduledAt.setHours(hours, minutes, 0, 0);
      }

      const response = await contentApi.scheduleContent(
        selectedItem.id,
        scheduledAt.toISOString(),
      );

      setContentItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id ? { ...item, ...response.data } : item,
        ),
      );

      setScheduleOpen(false);
      setSelectedItem(null);

      router.push('/merchant/calendar');
    } catch (error) {
      console.error('Failed to schedule content:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getPreviewText = (item: ContentItem) => {
    if (item.prompt) {
      return item.prompt.length > 100 ? item.prompt.substring(0, 100) + '...' : item.prompt;
    }
    if (item.generatedText) {
      return item.generatedText.length > 100 ? item.generatedText.substring(0, 100) + '...' : item.generatedText;
    }
    return 'No description available';
  };

  const getPreviewImage = (item: ContentItem) => {
    return item.generatedImage || item.generatedVideo;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Content Library</h1>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreateNew}>
              Create New
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-32 bg-gray-100 animate-pulse"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Content Library</h1>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreateNew}>
            Create New
          </Button>
        </div>

        {contentItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
            <p className="text-gray-500 mb-4">Start creating content to see it here</p>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreateNew}>
              Create Your First Content
            </Button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                  {/* Preview Area */}
                  <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                    {getPreviewImage(item) ? (
                      <img
                        src={getPreviewImage(item)}
                        alt={item.prompt || 'Content preview'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                        <span className="text-sm text-gray-600">
                          {item.type?.toUpperCase() || 'CONTENT'}
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 rounded-full bg-white/80 hover:bg-white"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === 'draft'
                            ? 'bg-gray-100 text-gray-700'
                            : item.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.status || 'draft'}
                      </span>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {getPreviewText(item)}
                    </p>

                    {/* Platform Badge */}
                    {item.platform && (
                      <div className="mb-3">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {item.platform}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleView(item)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleScheduleClick(item)}
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule
                      </Button>
                      <Button
                        size="sm"
                        
                        variant="outline"
                        className="p-2"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <Button
                  onClick={() => fetchContent(page + 1, true)}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* View Modal */}
        <Dialog
          open={viewOpen}
          onOpenChange={(open) => {
            setViewOpen(open);
            if (!open) setSelectedItem(null);
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Content Details</DialogTitle>
                {selectedItem && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(selectedItem)}
                    className="h-8 text-xs"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              <DialogDescription>Full details of the selected content.</DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-4 text-sm">
                {getPreviewImage(selectedItem) && (
                  <div className="rounded-md overflow-hidden border">
                    <img
                      src={getPreviewImage(selectedItem)!}
                      alt={selectedItem.prompt || 'Content'}
                      className="w-full object-cover max-h-64"
                    />
                  </div>
                )}

                <div>
                  <p className="font-medium text-gray-900 mb-1">Prompt</p>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedItem.prompt || 'N/A'}
                  </p>
                </div>

                {selectedItem.generatedText && (
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Generated Text</p>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedItem.generatedText}
                    </p>
                  </div>
                )}

                {selectedItem.generatedVideo && !selectedItem.generatedImage && (
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Generated Video</p>
                    <p className="text-gray-700 break-all">
                      {selectedItem.generatedVideo}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div>
                    <p className="font-medium text-gray-800">Type</p>
                    <p>{selectedItem.type}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Platform</p>
                    <p>{selectedItem.platform || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Status</p>
                    <p>{selectedItem.status}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Created</p>
                    <p>{new Date(selectedItem.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedItem.scheduledAt && (
                    <div>
                      <p className="font-medium text-gray-800">Scheduled At</p>
                      <p>{new Date(selectedItem.scheduledAt).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedItem.publishedAt && (
                    <div>
                      <p className="font-medium text-gray-800">Published At</p>
                      <p>{new Date(selectedItem.publishedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Schedule Modal */}
        <Dialog
          open={scheduleOpen}
          onOpenChange={(open) => {
            setScheduleOpen(open);
            if (!open) {
              setSelectedItem(null);
              setTimePickerOpen(false);
            }
          }}
        >
          <DialogContent className="max-w-sm w-[90vw] sm:w-full">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-bold">Schedule Content</DialogTitle>
              <DialogDescription className="text-xs text-gray-600 mt-1">
                Select a date and time to post this content.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Calendar Section - Compact */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Select Date
                </label>
                <div className="flex justify-center p-2">
                  <DateCalendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={(date) => {
                      if (date) setScheduleDate(date);
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </div>
              </div>

              {/* Selected Date Row with Clock Icon and Time Display */}
              {scheduleDate && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 mb-1">Selected Date</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {new Date(scheduleDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  {/* Time Display or Popover */}
                  <div className="flex items-center gap-2">
                    {scheduleTime && (
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Time</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {formatTime(scheduleTime)}
                        </p>
                      </div>
                    )}
                    <Popover open={timePickerOpen} onOpenChange={setTimePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded flex-shrink-0 hover:bg-blue-50 hover:border-blue-300"
                          title="Click to select time"
                        >
                          <Clock className="w-4 h-4 text-blue-600" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="left" align="center" className="w-auto p-0 border border-gray-300 shadow-md">
                        <TimePickerCompact
                          value={scheduleTime}
                          onChange={setScheduleTime}
                          onClose={() => setTimePickerOpen(false)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Schedule Summary Card */}
              {scheduleDate && scheduleTime && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-widest">
                    📅 Scheduled For
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(scheduleDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm font-bold text-blue-600">
                      {formatTime(scheduleTime)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <DialogFooter className="flex gap-2 pt-3 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setScheduleOpen(false);
                  setSelectedItem(null);
                  setTimePickerOpen(false);
                }}
                disabled={actionLoading}
                className="px-3 py-1.5 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                disabled={actionLoading || !scheduleDate || !scheduleTime}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white"
              >
                {actionLoading ? (
                  <>
                    <div className="inline-block animate-spin mr-2">
                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                    </div>
                    Scheduling...
                  </>
                ) : (
                  'Schedule'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) setSelectedItem(null);
          }}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Content</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'OK'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
