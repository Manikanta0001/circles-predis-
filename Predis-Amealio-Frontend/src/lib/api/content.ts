import apiClient from '../api';

export interface ContentItem {
  id: string;
  userId: string;
  brandId?: string;
  type: string;
  prompt?: string;
  generatedText?: string;
  generatedImage?: string;
  generatedVideo?: string;
  status: 'draft' | 'published' | 'scheduled';
  platform?: string;
  scheduledAt?: string;
  publishedAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  brand?: {
    id: string;
    name: string;
    logo?: string;
  };
  analytics?: Array<{
    views: number;
    likes: number;
    shares: number;
  }>;
}

export interface DailyTrendPoint {
  date: string;
  label: string;
  views: number;
  likes: number;
  shares: number;
  posts: number;
}

export interface PlatformBreakdownRow {
  platform: string;
  views: number;
  likes: number;
  shares: number;
  posts: number;
  engagementRate: number;
}

export interface ContentTypeBreakdownRow {
  type: string;
  label: string;
  count: number;
  avgEngagement: number;
}

export interface DashboardStats {
  totalContent: number;
  draftedContent: number;
  scheduledContent: number;
  publishedContent: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  recentContent: ContentItem[];
  range?: '7d' | '30d' | '90d';
  rangeDays?: number;
  dailyTrend?: DailyTrendPoint[];
  platformBreakdown?: PlatformBreakdownRow[];
  contentTypeBreakdown?: ContentTypeBreakdownRow[];
  widgets?: {
    upcomingScheduled: Array<{
      id: string;
      type: string;
      platform?: string;
      scheduledAt?: string;
      prompt?: string;
      brand?: { id: string; name: string } | null;
    }>;
    recentDrafts: Array<{
      id: string;
      type: string;
      platform?: string;
      updatedAt?: string;
      prompt?: string;
      brand?: { id: string; name: string } | null;
    }>;
    topContent: Array<{
      id: string;
      type: string;
      platform?: string;
      status?: string;
      createdAt?: string;
      prompt?: string;
      brand?: { id: string; name: string } | null;
      metrics: {
        views: number;
        likes: number;
        shares: number;
        comments: number;
        engagement: number;
      };
    }>;
    credits: number;
    subscriptionTier: string;
  };
}

export const contentApi = {
  // Generate content
  generateContent: (data: any) =>
    apiClient.post('/merchant/generate', data),

  promptSuggestions: (data: any) =>
    apiClient.post('/merchant/prompt-suggestions', data),

  // Save content
  saveContent: (data: any) =>
    apiClient.post('/merchant/save', data),

  // Get dashboard stats (optional range: 7d | 30d | 90d)
  getDashboardStats: (range?: '7d' | '30d' | '90d') =>
    apiClient.get<DashboardStats>('/merchant/dashboard', {
      params: range ? { range } : {},
    }),

  // Get content list with optional filter and paging
  getContent: (
    filter?: 'all' | 'draft' | 'published' | 'scheduled',
    page: number = 1,
    limit: number = 12,
  ) =>
    apiClient.get<ContentItem[]>('/merchant/content/list', {
      params: {
        ...(filter && filter !== 'all' ? { filter } : {}),
        page,
        limit,
      },
    }),

  // Get content by ID
  getContentById: (id: string) =>
    apiClient.get<ContentItem>(`/merchant/content/${id}`),

  // Delete content
  deleteContent: (id: string) =>
    apiClient.delete(`/merchant/content/${id}`),

  // Schedule content
  scheduleContent: (id: string, scheduledAt: string) =>
    apiClient.post(`/merchant/content/${id}/schedule`, { scheduledAt }),
};
