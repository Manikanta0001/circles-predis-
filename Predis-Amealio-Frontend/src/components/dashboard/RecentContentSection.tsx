'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Image, Video, Facebook, Instagram, Linkedin } from 'lucide-react';
import { contentApi, ContentItem } from '@/lib/api/content';

interface RecentContentSectionProps {
  onContentClick?: (content: ContentItem) => void;
  onShareClick?: (content: ContentItem) => void;
}

export default function RecentContentSection({ 
  onContentClick,
  onShareClick 
}: RecentContentSectionProps) {
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'scheduled'>('all');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [filter]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      console.log(`Fetching content with filter: ${filter}...`);
      const response = await contentApi.getContent(filter);
      console.log('Content response:', response.data);
      setContent(response.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram': return <Instagram className="w-4 h-4" />;
      case 'Facebook': return <Facebook className="w-4 h-4" />;
      case 'LinkedIn': return <Linkedin className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      scheduled: 'bg-blue-100 text-blue-700'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const handleContentClick = (item: ContentItem) => {
    if (onContentClick) {
      onContentClick(item);
    } else {
      console.log('Content clicked:', item.id);
    }
  };

  const handleShareClick = (e: React.MouseEvent, item: ContentItem) => {
    e.stopPropagation();
    if (onShareClick) {
      onShareClick(item);
    } else {
      console.log('Share:', item.id);
    }
  };

  const getContentTitle = (item: ContentItem) => {
    if (item.prompt) {
      return item.prompt.length > 50 ? item.prompt.substring(0, 50) + '...' : item.prompt;
    }
    return `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Content`;
  };

  const getThumbnail = (item: ContentItem) => {
    if (item.generatedImage) return item.generatedImage;
    if (item.generatedVideo) return item.generatedVideo;
    return undefined;
  };

  const getPlatforms = (item: ContentItem) => {
    if (item.platform) return [item.platform];
    return ['Instagram']; // Default fallback
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-5 flex-1">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Content</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter Bar */}
        <div className="flex gap-2 mb-6">
          {(['all', 'draft', 'published', 'scheduled'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="capitalize"
            >
              {filterType}
            </Button>
          ))}
        </div>

        {/* Content List */}
        <div className="space-y-4">
          {content.map((item) => (
            <div
              key={item.id}
              onClick={() => handleContentClick(item)}
              className="group flex items-center justify-between p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
            >
              {/* Left Section - Thumbnail */}
              <div className="flex items-center gap-5 flex-1">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {getThumbnail(item) ? (
                    <img 
                      src={getThumbnail(item)} 
                      alt={getContentTitle(item)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      {item.type === 'image' ? (
                        <Image className="w-6 h-6 text-gray-400" />
                      ) : (
                        <Video className="w-6 h-6 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-500 mt-1">
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Middle Section - Content Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">
                    {getContentTitle(item)}
                  </h3>
                  
                  {/* Platforms */}
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs text-gray-500">Platforms:</span>
                    <div className="flex gap-2">
                      {getPlatforms(item).map((platform) => (
                        <div 
                          key={platform}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600"
                        >
                          {getPlatformIcon(platform)}
                          <span>{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-gray-400">
                    Date: {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Right Section - Actions & Status */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Share Icon */}
                <button
                  onClick={(e) => handleShareClick(e, item)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-gray-500" />
                </button>

                {/* Status Badge */}
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {content.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No content found for the selected filter.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
