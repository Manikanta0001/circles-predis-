'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Copy, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { contentApi, ContentItem } from '@/lib/api/content';
import { useSearchParams } from 'next/navigation';

// ------------ TYPES ------------
type ContentType = 'text' | 'image' | 'video';
type Platform = 'instagram' | 'facebook' | 'linkedin';
type TextModel = 'llama' | 'gpt' | 'gemini';
type ImageModel = 'qwen' | 'gpt' | 'gemini';
type VideoModel = 'wan' | 'ltx' | 'veo3';
type TextType = 'caption' | 'hashtags' | 'long-post';
type AspectRatio = '1:1' | '4:5' | '9:16';
type VideoType = 'short-video' | 'reel-script'  | 'script-only';
type Duration = '5s' | '10s' | '15s';
type Tone = 'professional' | 'casual';

// ------------ SUGGESTIONS ------------
const TEXT_SUGGESTIONS = [
  'Create a catchy Instagram caption about sustainable fashion',
  'Write engaging hashtags for a tech startup launch',
  'Draft a long-form LinkedIn post about remote work benefits',
  'Generate a caption for a food photography post',
  'Create hashtags for a fitness brand campaign',
];

const IMAGE_SUGGESTIONS = [
  'A minimalist workspace with natural lighting',
  'Vibrant street art in an urban setting',
  'Serene mountain landscape at sunset',
  'Modern coffee shop interior design',
  'Abstract geometric patterns in bold colors',
];

const VIDEO_SUGGESTIONS = [
  'A 15-second product demo showcasing key features',
  'A quick tutorial on using the mobile app',
  'Behind-the-scenes footage of a team meeting',
  'A customer testimonial video script',
  'A promotional video for a new service launch',
];

const MAX_VISIBLE_SUGGESTIONS = 6;

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getSuggestionScore(queryRaw: string, suggestionRaw: string) {
  const query = normalizeForMatch(queryRaw);
  const suggestion = normalizeForMatch(suggestionRaw);

  if (!query) return 1;
  if (!suggestion) return 0;

  if (suggestion === query) return 200;
  if (suggestion.startsWith(query)) return 160;
  if (suggestion.includes(query)) return 120;

  const queryTokens = query.split(' ').filter(Boolean);
  if (queryTokens.length === 0) return 1;

  let tokenScore = 0;
  for (const token of queryTokens) {
    if (token.length < 2) continue;
    if (suggestion.includes(token)) tokenScore += 18;
  }

  if (tokenScore > 0) return tokenScore;

  let sIdx = 0;
  for (let qIdx = 0; qIdx < query.length; qIdx += 1) {
    const ch = query[qIdx];
    sIdx = suggestion.indexOf(ch, sIdx);
    if (sIdx === -1) return 0;
    sIdx += 1;
  }

  return 40;
}

function renderHighlightedSuggestion(suggestion: string, queryRaw: string) {
  const query = queryRaw.trim();
  if (query.length < 2) return suggestion;

  const lowerSuggestion = suggestion.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerSuggestion.indexOf(lowerQuery);

  if (matchIndex === -1) return suggestion;

  const before = suggestion.slice(0, matchIndex);
  const match = suggestion.slice(matchIndex, matchIndex + query.length);
  const after = suggestion.slice(matchIndex + query.length);

  return (
    <>
      {before}
      <span className="font-semibold text-gray-900">{match}</span>
      {after}
    </>
  );
}

export default function CreateContentPage() {
  const searchParams = useSearchParams();

  // ----------------------------------------
  // STATE
  // ----------------------------------------
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [textModel, setTextModel] = useState<TextModel>('llama');
  const [imageModel, setImageModel] = useState<ImageModel>('qwen');
  const [videoModel, setVideoModel] = useState<VideoModel>('wan');

  // Dynamic options state
  const [textType, setTextType] = useState<TextType | null>(null);
  const [tone, setTone] = useState<Tone>('professional');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio | null>(null);
  const [textOverlay, setTextOverlay] = useState<boolean | null>(null);
  const [overlayText, setOverlayText] = useState('');
  const [videoType, setVideoType] = useState<VideoType | null>(null);
  const [duration, setDuration] = useState<Duration | null>(null);

  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement | null>(null);
  const skipNextSuggestionFetchRef = useRef(false);
  const lastSuggestionQueryRef = useRef<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [loadedItem, setLoadedItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) return; // edit mode handled below

    const type = searchParams.get('type')?.toLowerCase() as ContentType | null;
    const platformParam = searchParams.get('platform')?.toLowerCase() as Platform | null;
    const textTypeParam = searchParams.get('textType')?.toLowerCase() as TextType | null;
    const toneParam = searchParams.get('tone')?.toLowerCase() as Tone | null;
    const aspectRatioParam = searchParams.get('aspectRatio') as AspectRatio | null;
    const videoTypeParam = searchParams.get('videoType')?.toLowerCase() as VideoType | null;
    const durationParam = searchParams.get('duration')?.toLowerCase() as Duration | null;
    const promptParam = searchParams.get('prompt');

    if (type && ['text', 'image', 'video'].includes(type)) {
      setContentType(type);
      // reset dependent choices when type changes via preset
      setPlatform(null);
      setTextType(null);
      setAspectRatio(null);
      setVideoType(null);
      setDuration(null);

      if (type === 'text') {
        setTextType('caption');
      } else if (type === 'image') {
        setAspectRatio('1:1');
      } else if (type === 'video') {
        setVideoType('short-video');
        setDuration('10s');
      }
    }

    if (platformParam && ['instagram', 'facebook', 'linkedin'].includes(platformParam)) {
      setPlatform(platformParam);
    }

    if (toneParam && ['professional', 'casual'].includes(toneParam)) {
      setTone(toneParam);
    }

    if (textTypeParam && ['caption', 'hashtags', 'long-post'].includes(textTypeParam)) {
      setTextType(textTypeParam);
    }

    if (aspectRatioParam && ['1:1', '4:5', '9:16'].includes(aspectRatioParam)) {
      setAspectRatio(aspectRatioParam);
    }

    if (videoTypeParam && ['short-video', 'reel-script', 'script-only'].includes(videoTypeParam)) {
      setVideoType(videoTypeParam);
    }

    if (durationParam && ['5s', '10s', '15s'].includes(durationParam)) {
      setDuration(durationParam);
    }

    if (typeof promptParam === 'string' && promptParam.trim().length > 0) {
      setPrompt(promptParam.trim());
    }
  }, [searchParams]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;

    async function loadExistingContent() {
      try {
        const response = await contentApi.getContentById(id as string);
        const item = response.data;

        setLoadedItem(item);
        setIsEditing(true);

        let detectedType: ContentType | null = null;
        if (item.type === 'text' || item.generatedText) detectedType = 'text';
        else if (item.type === 'image' || item.generatedImage) detectedType = 'image';
        else if (item.type === 'video' || item.generatedVideo) detectedType = 'video';

        if (detectedType) {
          setContentType(detectedType);

          // Best-effort defaults for dynamic options so UI does not look empty
          if (detectedType === 'text') {
            // We don't persist textType yet; default to caption for editing
            setTextType('caption');
          }
        }

        if (item.platform) {
          const lower = item.platform.toLowerCase();
          if (['instagram', 'facebook', 'linkedin'].includes(lower)) {
            setPlatform(lower as Platform);
          }
        }

        setPrompt(item.prompt || '');

        if (item.generatedText) setOutput(item.generatedText);
        else if (item.generatedImage) setOutput(item.generatedImage);
        else if (item.generatedVideo) setOutput(item.generatedVideo);
      } catch (err: any) {
        console.error('Failed to load content for editing:', err);
        toast.error(err.message || 'Failed to load content');
      }
    }

    loadExistingContent();
  }, [searchParams]);

  // STEP VISIBILITY
  const canShowStep2 = !!contentType;
  const canShowStep3 = !!contentType && !!platform;
  const canShowStep4 = !!contentType && !!platform && !!(
    contentType === 'text' ? textType :
    contentType === 'image' ? aspectRatio :
    contentType === 'video' ? videoType && duration : null
  );
  const canShowStep5 = canShowStep4;
  const canShowStep6 = canShowStep4 && prompt.trim().length > 0;

  const baseSuggestions = useMemo(() => {
    if (contentType === 'text') return TEXT_SUGGESTIONS;
    if (contentType === 'image') return IMAGE_SUGGESTIONS;
    if (contentType === 'video') return VIDEO_SUGGESTIONS;
    return [];
  }, [contentType]);

  useEffect(() => {
    if (!canShowStep5 || !contentType || !platform) {
      setAiSuggestions([]);
      setSuggestionsLoading(false);
      lastSuggestionQueryRef.current = '';
      return;
    }

    const query = prompt.trim();
    if (skipNextSuggestionFetchRef.current) {
      skipNextSuggestionFetchRef.current = false;
      return;
    }

    if (query.length < 8) {
      setAiSuggestions([]);
      setSuggestionsLoading(false);
      lastSuggestionQueryRef.current = '';
      return;
    }

    const signature = JSON.stringify({
      query,
      contentType,
      platform,
      textType,
      tone,
      aspectRatio,
      textOverlay,
      overlayText,
      videoType,
      duration,
    });

    if (lastSuggestionQueryRef.current === signature) return;
    lastSuggestionQueryRef.current = signature;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        const response = await contentApi.promptSuggestions({
          type: contentType,
          platform,
          prompt: query,
          textType: contentType === 'text' ? textType : undefined,
          tone: contentType === 'text' ? tone : undefined,
          aspectRatio: contentType === 'image' ? aspectRatio : undefined,
          textOverlay: contentType === 'image' ? textOverlay : undefined,
          overlayText: contentType === 'image' && textOverlay ? overlayText : undefined,
          videoType: contentType === 'video' ? videoType : undefined,
          duration: contentType === 'video' ? duration : undefined,
        });

        const suggestions = (response.data?.suggestions || []).filter(
          (s: unknown) => typeof s === 'string' && s.trim().length > 0
        ) as string[];

        if (!cancelled) setAiSuggestions(suggestions);
      } catch {
        if (!cancelled) setAiSuggestions([]);
      } finally {
        if (!cancelled) setSuggestionsLoading(false);
      }
    }, 550);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [
    canShowStep5,
    contentType,
    platform,
    prompt,
    textType,
    tone,
    aspectRatio,
    textOverlay,
    overlayText,
    videoType,
    duration,
  ]);

  const allSuggestions = useMemo(() => {
    const merged = [...aiSuggestions, ...baseSuggestions];
    const unique: string[] = [];
    const seen = new Set<string>();
    for (const s of merged) {
      const key = s.trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(s);
    }
    return unique;
  }, [aiSuggestions, baseSuggestions]);

  const { visibleSuggestions, highlightQuery } = useMemo(() => {
    const query = prompt.trim();
    if (!query) {
      return {
        visibleSuggestions: allSuggestions.slice(0, MAX_VISIBLE_SUGGESTIONS),
        highlightQuery: '',
      };
    }

    if (query.length < 2) {
      return {
        visibleSuggestions: allSuggestions.slice(0, MAX_VISIBLE_SUGGESTIONS),
        highlightQuery: '',
      };
    }

    const ranked = allSuggestions
      .map((suggestion, index) => ({
        suggestion,
        index,
        score: getSuggestionScore(query, suggestion),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, MAX_VISIBLE_SUGGESTIONS)
      .map((item) => item.suggestion);

    if (ranked.length > 0) {
      return { visibleSuggestions: ranked, highlightQuery: query };
    }

    return {
      visibleSuggestions: allSuggestions.slice(0, Math.min(3, allSuggestions.length)),
      highlightQuery: '',
    };
  }, [allSuggestions, prompt]);

  // ----------------------------------------
  // HANDLERS
  // ----------------------------------------
  const handleSuggestionClick = (suggestion: string) => {
    skipNextSuggestionFetchRef.current = true;
    setPrompt(suggestion);
    queueMicrotask(() => promptRef.current?.focus());
  };

  async function handleGenerate() {
    if (!contentType || !platform || !prompt.trim()) {
      toast.error('Please complete all required steps.');
      return;
    }

    // Validate dynamic options
    if (contentType === 'text' && !textType) {
      toast.error('Please select a text type.');
      return;
    }
    if (contentType === 'image' && !aspectRatio) {
      toast.error('Please select an aspect ratio.');
      return;
    }
    if (contentType === 'video' && (!videoType || !duration)) {
      toast.error('Please complete video options.');
      return;
    }

    setLoading(true);
    setOutput(null);

    try {
      const model = contentType === 'text' ? textModel :
                   contentType === 'image' ? imageModel :
                   contentType === 'video' ? videoModel : null;

      const response = await contentApi.generateContent({
        type: contentType,
        platform,
        model,
        prompt,
        textType: contentType === 'text' ? textType : undefined,
        tone: contentType === 'text' ? tone : undefined,
        aspectRatio: contentType === 'image' ? aspectRatio : undefined,
        textOverlay: contentType === 'image' ? textOverlay : undefined,
        overlayText: contentType === 'image' && textOverlay ? overlayText : undefined,
        videoType: contentType === 'video' ? videoType : undefined,
        duration: contentType === 'video' ? duration : undefined,
      });

      setOutput(response.data.output || response.data.generatedText || response.data.generatedImage || 'Content generated successfully!');
      toast.success('Content generated!');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success('Copied to clipboard!');
    }
  }

  function handleRegenerate() {
    handleGenerate();
  }

  async function handleSave() {
    if (!output) {
      toast.error('No content to save.');
      return;
    }

    try {
      await contentApi.saveContent({
        type: contentType,
        platform,
        prompt,
        generatedText: contentType === 'text' ? output : undefined,
        generatedImage: contentType === 'image' ? output : undefined,
        generatedVideo: contentType === 'video' ? output : undefined,
        status: 'draft',
      });
      toast.success('Saved to library!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save content');
    }
  }

  // Reset when content type changes
  const handleContentTypeChange = (type: ContentType) => {
    setContentType(type);
    setPlatform(null);
    setTextType(null);
    setTone('professional');
    setAspectRatio(null);
    setTextOverlay(null);
    setOverlayText('');
    setVideoType(null);
    setDuration(null);
    setPrompt('');
    setOutput(null);
  };

  return (
    <DashboardLayout>
      <div className="flex gap-4 h-full">
        {/* LEFT SIDE - Main Content Form */}
        <div className="flex-1 space-y-3">
          <h1 className="text-xl font-bold">Create Content</h1>
          
          {/* STEP 1 — Content Type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Content Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <button
                  onClick={() => handleContentTypeChange('text')}
                  className={`flex-1 p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    contentType === 'text' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xl">✏️</div>
                    <div className="text-xs font-semibold text-gray-900">Text</div>
                  </div>
                </button>

                <button
                  onClick={() => handleContentTypeChange('image')}
                  className={`flex-1 p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    contentType === 'image' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xl">🖼</div>
                    <div className="text-xs font-semibold text-gray-900">Image</div>
                  </div>
                </button>

                <button
                  onClick={() => handleContentTypeChange('video')}
                  className={`flex-1 p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    contentType === 'video' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xl">🎥</div>
                    <div className="text-xs font-semibold text-gray-900">Video</div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* STEP 2 — Platform */}
          {canShowStep2 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPlatform('instagram')}
                    className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      platform === 'instagram' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-gray-900">Instagram</div>
                  </button>
                  <button
                    onClick={() => setPlatform('facebook')}
                    className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      platform === 'facebook' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-gray-900">Facebook</div>
                  </button>
                  <button
                    onClick={() => setPlatform('linkedin')}
                    className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      platform === 'linkedin' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-gray-900">LinkedIn</div>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3 — Dynamic Options */}
          {canShowStep3 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  {contentType === 'text' && 'Text Type'}
                  {contentType === 'image' && 'Aspect Ratio'}
                  {contentType === 'video' && 'Video Type'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contentType === 'text' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTextType('caption')}
                        className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          textType === 'caption' 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-900">Caption</div>
                      </button>
                      <button
                        onClick={() => setTextType('hashtags')}
                        className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          textType === 'hashtags' 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-900">Hashtags</div>
                      </button>
                      <button
                        onClick={() => setTextType('long-post')}
                        className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          textType === 'long-post' 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-900">Long Post</div>
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1.5 block">Tone</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTone('professional')}
                          className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            tone === 'professional'
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                          }`}
                        >
                          <div className="text-xs font-semibold text-gray-900">Professional</div>
                        </button>
                        <button
                          onClick={() => setTone('casual')}
                          className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            tone === 'casual'
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                          }`}
                        >
                          <div className="text-xs font-semibold text-gray-900">Casual</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {contentType === 'image' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAspectRatio('1:1')}
                        className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          aspectRatio === '1:1' 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-900">1:1</div>
                      </button>
                      <button
                        onClick={() => setAspectRatio('4:5')}
                        className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          aspectRatio === '4:5' 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-900">4:5</div>
                      </button>
                      <button
                        onClick={() => setAspectRatio('9:16')}
                        className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          aspectRatio === '9:16' 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-900">9:16</div>
                      </button>
                    </div>
                  </div>
                )}

                {contentType === 'video' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVideoType('reel-script')}
                        className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          videoType === 'reel-script' 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-900">Reel Script</div>
                      </button>
                      <button
                        onClick={() => setVideoType('short-video')}
                        className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          videoType === 'short-video' 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-900">Short Video</div>
                      </button>
                      <button
                        onClick={() => setVideoType('script-only')}
                        className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          videoType === 'script-only' 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-900">Script Only</div>
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1.5 block">Duration</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDuration('5s')}
                          className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            duration === '5s' 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                          }`}
                        >
                          <div className="text-xs font-semibold text-gray-900">5s</div>
                        </button>
                        <button
                          onClick={() => setDuration('10s')}
                          className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            duration === '10s' 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                          }`}
                        >
                          <div className="text-xs font-semibold text-gray-900">10s</div>
                        </button>
                        <button
                          onClick={() => setDuration('15s')}
                          className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            duration === '15s' 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                          }`}
                        >
                          <div className="text-xs font-semibold text-gray-900">15s</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* STEP 4 — AI Model */}
          {canShowStep4 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">AI Model</CardTitle>
              </CardHeader>
              <CardContent>
                {contentType === 'text' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTextModel('llama')}
                      className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        textModel === 'llama' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      <div className="text-xs font-semibold text-gray-900">LLaMA</div>
                    </button>
                    <button
                      disabled
                      className="flex-1 p-2 border-2 rounded-full bg-gray-100 opacity-50 cursor-not-allowed"
                    >
                      <div className="text-xs font-semibold text-gray-500">GPT</div>
                    </button>
                    <button
                      disabled
                      className="flex-1 p-2 border-2 rounded-full bg-gray-100 opacity-50 cursor-not-allowed"
                    >
                      <div className="text-xs font-semibold text-gray-500">Gemini</div>
                    </button>
                  </div>
                )}

                {contentType === 'image' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setImageModel('qwen')}
                      className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        imageModel === 'qwen' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      <div className="text-xs font-semibold text-gray-900">Qwen</div>
                    </button>
                    <button
                      disabled
                      className="flex-1 p-2 border-2 rounded-full bg-gray-100 opacity-50 cursor-not-allowed"
                    >
                      <div className="text-xs font-semibold text-gray-500">GPT</div>
                    </button>
                    <button
                      disabled
                      className="flex-1 p-2 border-2 rounded-full bg-gray-100 opacity-50 cursor-not-allowed"
                    >
                      <div className="text-xs font-semibold text-gray-500">Gemini</div>
                    </button>
                  </div>
                )}

                {contentType === 'video' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVideoModel('wan')}
                      className={`flex-1 p-2 border-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        videoModel === 'wan' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      <div className="text-xs font-semibold text-gray-900">WAN</div>
                    </button>
                    <button
                      disabled
                      className="flex-1 p-2 border-2 rounded-full bg-gray-100 opacity-50 cursor-not-allowed"
                    >
                      <div className="text-xs font-semibold text-gray-500">LTX</div>
                    </button>
                    <button
                      disabled
                      className="flex-1 p-2 border-2 rounded-full bg-gray-100 opacity-50 cursor-not-allowed"
                    >
                      <div className="text-xs font-semibold text-gray-500">VEO3</div>
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* STEP 5 — Prompt + Suggestions */}
          {canShowStep5 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  className="min-h-[80px] text-sm"
                  ref={promptRef}
                />

                {/* Optional Overlay Text for images */}
                {contentType === 'image' && (
                  <div className="space-y-1.5 pt-1 border-t border-gray-100">
                    <label className="text-xs font-medium text-gray-700">Overlay Text (optional)</label>
                    <Input
                      value={overlayText}
                      onChange={(e) => {
                        const value = e.target.value;
                        setOverlayText(value);
                        setTextOverlay(value.trim().length > 0 ? true : null);
                      }}
                      placeholder="Enter overlay text (will be placed on top of the image)"
                      className="h-8 text-sm"
                    />
                  </div>
                )}

                {visibleSuggestions.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-700">Suggestions</label>
                      {suggestionsLoading && (
                        <span className="text-[10px] text-gray-500">Generating…</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {visibleSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-left p-2 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-xs text-gray-700"
                        >
                          {renderHighlightedSuggestion(suggestion, highlightQuery)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* STEP 6 — Generate Button */}
          {canShowStep6 && (
            <Card>
              <CardContent className="pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full"
                  size="default"
                >
                  {loading ? 'Generating...' : 'Generate Content'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT SIDE - Fixed Output Panel */}
        <div className="w-80 flex-shrink-0">
          <Card className="sticky top-6 h-120 flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-base font-semibold">Output Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col min-h-0">
              {loading && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-3"></div>
                  <p className="text-gray-500 text-xs">Generating content...</p>
                </div>
              )}
              
              {!loading && !output && (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-xs">Generated content will appear here</p>
                </div>
              )}

              {!loading && output && (
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  <div className="bg-gray-50 rounded-lg p-3 flex-1 overflow-y-auto min-h-0">
                    {contentType === 'image' && (output.startsWith('data:image') || output.startsWith('http')) ? (
                      <img src={output} alt="Generated" className="w-full rounded" />
                    ) : contentType === 'video' && (output.startsWith('data:video') || output.startsWith('http')) ? (
                      <video
                        src={output}
                        controls
                        className="w-full rounded"
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap text-xs text-gray-800">{output}</pre>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Button
                      variant="outline"
                      onClick={handleCopy}
                      className="w-full h-8 text-xs"
                      size="sm"
                    >
                      <Copy className="w-3 h-3 mr-1.5" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRegenerate}
                      className="w-full h-8 text-xs"
                      size="sm"
                      disabled={loading}
                    >
                      <RefreshCw className="w-3 h-3 mr-1.5" />
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      className="w-full h-8 text-xs"
                      size="sm"
                    >
                      <Save className="w-3 h-3 mr-1.5" />
                      Save to Library
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
