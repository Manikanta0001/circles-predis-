import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from '../common/entities/content.entity';
import { Brand } from '../common/entities/brand.entity';
import { RedisService } from '../common/redis.service';
import { AIService } from '../integrations/ai/ai.service';
import { GenerateContentDto } from './dto/generate-content.dto';
import { SaveContentDto } from './dto/save-content.dto';
import crypto from 'crypto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    private redis: RedisService,
    private aiService: AIService,
  ) {}

  async generateContent(userId: string, dto: GenerateContentDto) {
    let generatedText = null;
    let generatedImage = null;
    let generatedVideo = null;

    let brandName = '';
    if (dto.brandId) {
      const brand = await this.brandRepository.findOne({
        where: { id: dto.brandId, userId },
      });
      if (brand) {
        brandName = brand.name;
      }
    }

    try {
      if (dto.type === 'text') {
        const modelForText = dto.model === 'llama' ? undefined : dto.model;
        const finalPrompt = this.buildTextPrompt(dto, brandName);
        generatedText = await this.aiService.generateText(finalPrompt, modelForText, 180);
        if ((dto.textType || 'caption') === 'hashtags' && generatedText) {
          const range = this.getHashtagCountRange((dto.platform || '').toLowerCase());
          generatedText = this.cleanHashtags(generatedText, range.max);
        }
      } else if (dto.type === 'image') {
        const promptToSend = this.buildImagePrompt(dto, brandName);
        generatedImage = await this.aiService.generateImage(promptToSend);
      } else if (dto.type === 'video') {
        let durationSeconds: number | undefined = undefined;

        if (dto.duration) {
          const trimmed = String(dto.duration).trim().toLowerCase();
          if (trimmed.endsWith('s')) {
            const value = parseInt(trimmed.replace('s', ''), 10);
            if (!isNaN(value) && value > 0) {
              durationSeconds = value;
            }
          }
        }

        const promptToSend = this.buildVideoPrompt(dto, brandName);
        generatedVideo = await this.aiService.generateTextToVideo(promptToSend, durationSeconds);
      }
    } catch (error: any) {
      console.error('AI Generation failed:', {
        type: dto.type,
        error: error.message,
        statusCode: error.status || error.response?.status,
      });

      if (dto.type === 'image') {
        throw new Error(`Image generation failed: ${error.message || 'Unknown error'}`);
      }

      if (dto.type === 'text') {
        throw new Error(`Text generation failed: ${error.message || 'Unknown error'}`);
      }

      if (dto.type === 'video') {
        throw new Error(`Video generation failed: ${error.message || 'Unknown error'}`);
      }
    }

    return {
      userId,
      type: dto.type,
      prompt: dto.prompt,
      generatedText,
      generatedImage,
      generatedVideo,
      platform: dto.platform,
      brandId: dto.brandId,
      output: generatedText || generatedImage || generatedVideo || null,
    };
  }

  private buildTextPrompt(dto: GenerateContentDto, brandName?: string) {
    const platform = (dto.platform || '').toLowerCase();
    const textType = (dto.textType || 'caption').toLowerCase();
    const tone = (dto.tone || 'professional').toLowerCase();
    const rules: string[] = [];
    rules.push('Write social media content only.');
    rules.push('Avoid explanations, headings, or meta commentary.');
    rules.push('Do not restate the user brief.');
    rules.push('No markdown headings.');

    if (tone === 'professional') {
      rules.push('Tone: professional, polished, and confident.');
      rules.push('Avoid slang, excessive punctuation, and ALL CAPS.');
      if (platform === 'linkedin') {
        rules.push('Emojis: avoid emojis.');
      } else {
        rules.push('Emojis: use at most 1 subtle emoji only if it fits naturally.');
      }
      rules.push('Clarity: highlight value proposition and credibility.');
    } else {
      rules.push('Tone: casual, friendly, and upbeat.');
      rules.push('Contractions are allowed.');
      if (platform === 'linkedin') {
        rules.push('Emojis: use at most 1 emoji, keep it subtle.');
      } else {
        rules.push('Emojis: up to 2 emojis max, avoid overuse.');
      }
      rules.push('Clarity: keep it simple and relatable.');
    }

    if (platform === 'linkedin') {
      rules.push('Format: clean sentences, minimal fluff.');
    } else if (platform === 'instagram') {
      rules.push('Format: punchy and scroll-stopping.');
    } else if (platform === 'facebook') {
      rules.push('Format: friendly and community-oriented.');
    }

    if (textType === 'caption') {
      rules.push('Single caption in 1–2 short sentences, max ~35 words.');
      rules.push('Add 2–4 relevant hashtags at the end.');
    } else if (textType === 'hashtags') {
      const range = this.getHashtagCountRange(platform);
      rules.push(`Return only ${range.min}-${range.max} hashtags separated by spaces.`);
      rules.push('No sentences or bullets, each token must start with #.');
      if (tone === 'professional') {
        rules.push('Hashtags: prefer industry-relevant and brand-safe tags.');
      } else {
        rules.push('Hashtags: mix broad + niche + a couple of trending-style tags where appropriate.');
      }
    } else if (textType === 'long-post') {
      rules.push('Write 2–3 short paragraphs suitable for a long social post.');
      rules.push('Add 3–5 relevant hashtags at the end.');
    }
    const head: string[] = [];
    if (brandName) head.push(`Brand: ${brandName}`);
    head.push(`Platform: ${dto.platform}`);
    head.push(`Type: ${textType}`);
    head.push(`Tone: ${tone}`);
    const blocks: string[] = [];
    blocks.push(head.join('\n'));
    blocks.push('Guidelines:\n' + rules.join('\n'));
    blocks.push('User brief:\n' + dto.prompt);
    blocks.push('Return only the final content.');
    return blocks.join('\n\n');
  }

  private buildImagePrompt(dto: GenerateContentDto, brandName?: string) {
    const parts: string[] = [];
    if (brandName) parts.push(`Brand: ${brandName}`);
    parts.push('Goal: Generate a high-quality promotional image from the brief.');
    parts.push(`Platform: ${dto.platform}`);
    if (dto.aspectRatio) parts.push(`Aspect ratio: ${dto.aspectRatio}`);
    if (dto.textOverlay === true && dto.overlayText) {
      parts.push(`Overlay text: "${dto.overlayText}"`);
      parts.push('Ensure overlay is readable and well placed.');
    }
    parts.push('Style: Clean, modern, visually appealing.');
    parts.push('Constraints: No watermarks; brand-safe.');
    parts.push('Brief:\n' + dto.prompt);
    return parts.join('\n');
  }

  private buildVideoPrompt(dto: GenerateContentDto, brandName?: string) {
    const vt = (dto.videoType || '').toLowerCase();
    const parts: string[] = [];
    if (brandName) parts.push(`Brand: ${brandName}`);
    parts.push('Goal: Create a concise social video concept from the brief.');
    parts.push(`Platform: ${dto.platform}`);
    if (dto.duration) parts.push(`Target duration: ${dto.duration}`);
    if (vt) parts.push(`Video type: ${vt}`);
    if (vt === 'reel-script' || vt === 'script-only') {
      parts.push('Structure: Hook, key points, CTA. Keep lines short.');
    } else {
      parts.push('Structure: Quick cuts, clear sequence, closing CTA.');
    }
    parts.push('Tone: Energetic and engaging.');
    parts.push('Brief:\n' + dto.prompt);
    parts.push('Return only the script or single-line concept.');
    return parts.join('\n');
  }

  private buildPromptSuggestionsCacheKey(userId: string, dto: GenerateContentDto) {
    const payload = {
      userId,
      prompt: dto.prompt || '',
      type: dto.type || '',
      platform: dto.platform || '',
      textType: dto.textType || '',
      tone: dto.tone || '',
      aspectRatio: dto.aspectRatio || '',
      textOverlay: dto.textOverlay === true ? '1' : '0',
      overlayText: dto.overlayText || '',
      videoType: dto.videoType || '',
      duration: dto.duration || '',
    };

    const hash = crypto
      .createHash('sha1')
      .update(JSON.stringify(payload))
      .digest('hex');

    return `prompt_suggestions:${userId}:${hash}`;
  }

  private parsePromptSuggestions(raw: string): string[] {
    const trimmed = (raw || '').trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((v) => typeof v === 'string')
          .map((v) => v.trim())
          .filter(Boolean);
      }
    } catch {
    }

    const lines = trimmed
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[-*•\u2022]\s+/, ''))
      .map((line) => line.replace(/^\d+[\).\s]+/, ''))
      .map((line) => line.replace(/^"+|"+$/g, '').trim())
      .filter(Boolean);

    const unique: string[] = [];
    const seen = new Set<string>();

    for (const line of lines) {
      const normalized = line.toLowerCase();
      if (seen.has(normalized)) continue;
      if (line.length < 10) continue;
      unique.push(line);
      seen.add(normalized);
      if (unique.length >= 6) break;
    }

    return unique;
  }

  async generatePromptSuggestions(userId: string, dto: GenerateContentDto) {
    if (!dto?.prompt?.trim()) {
      return { suggestions: [] };
    }

    const cacheKey = this.buildPromptSuggestionsCacheKey(userId, dto);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const type = String(dto.type || '').toLowerCase();
    const platform = String(dto.platform || '').toLowerCase();
    const tone = String(dto.tone || 'professional').toLowerCase();

    const contextLines: string[] = [
      `Content type: ${type || 'unknown'}`,
      `Platform: ${platform || 'unknown'}`,
      `Tone: ${tone}`,
    ];

    if (type === 'text') {
      contextLines.push(`Text type: ${dto.textType || 'caption'}`);
    }

    if (type === 'image') {
      if (dto.aspectRatio) contextLines.push(`Aspect ratio: ${dto.aspectRatio}`);
      if (dto.textOverlay === true && dto.overlayText) {
        contextLines.push(`Overlay text: ${dto.overlayText}`);
      }
    }

    if (type === 'video') {
      if (dto.videoType) contextLines.push(`Video type: ${dto.videoType}`);
      if (dto.duration) contextLines.push(`Duration: ${dto.duration}`);
    }

    const promptForAI = [
      'Generate 5 alternative user prompts that improve and expand the user brief.',
      'Each suggestion should be a single line prompt that the user can click and use directly.',
      `The suggestions MUST match this tone: ${tone}.`,
      'Do NOT include numbering, bullets, headings, or explanations.',
      'Return ONLY a JSON array of strings, nothing else.',
      '',
      'User brief:',
      dto.prompt.trim(),
      '',
      'Context:',
      contextLines.join('\n'),
    ].join('\n');

    const modelForText = dto.model === 'llama' ? undefined : dto.model;
    const raw = await this.aiService.generateText(promptForAI, modelForText, 200);
    const suggestions = this.parsePromptSuggestions(raw).slice(0, 5);

    const response = { suggestions };
    await this.redis.set(cacheKey, JSON.stringify(response), 300);
    return response;
  }

  /**
   * Helper to clean up hashtag output from AI models.
   * Ensures output is a space-separated list of hashtags starting with #.
   */
  private getHashtagCountRange(platform: string): { min: number; max: number } {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return { min: 15, max: 30 };
      case 'linkedin':
        return { min: 3, max: 5 };
      case 'twitter':
      case 'x':
        return { min: 2, max: 3 };
      case 'tiktok':
        return { min: 8, max: 15 };
      case 'facebook':
        return { min: 5, max: 8 };
      default:
        return { min: 7, max: 12 };
    }
  }

  /**
   * Helper to clean up hashtag output from AI models.
   * Ensures output is a space-separated list of unique, normalized hashtags.
   */
  private cleanHashtags(text: string, maxCount: number = 30): string {
    // 1. Extract hashtag-like tokens with support for unicode letters/numbers/underscore.
    const tokens = Array.from(text.matchAll(/#([\p{L}\p{N}_]+)/gu)).map(
      (m) => m[0],
    );

    // 2. Fallback: if no explicit hashtags returned, split by spaces and special chars.
    const rawCandidates = tokens.length > 0
      ? tokens
      : text.split(/[\s,;\n]+/).filter((part) => part.trim().length > 0);

    const seen = new Set<string>();
    const normalized: string[] = [];

    for (let candidate of rawCandidates) {
      candidate = candidate.trim();
      if (candidate.length === 0) continue;

      // Ensure begins with # and strip trailing punctuation from token.
      if (!candidate.startsWith('#')) {
        candidate = '#' + candidate;
      }

      const match = candidate.match(/^#([\p{L}\p{N}_]+)/u);
      if (!match) continue;

      const hashtag = '#' + match[1].toLowerCase();

      if (hashtag.length <= 1) continue;
      if (seen.has(hashtag)) continue;

      seen.add(hashtag);
      normalized.push(hashtag);

      if (normalized.length >= maxCount) break;
    }

    return normalized.join(' ');
  }

  async saveContent(userId: string, dto: SaveContentDto) {
    const content = this.contentRepository.create({
      userId,
      type: dto.type,
      prompt: dto.prompt,
      generatedText: dto.generatedText,
      generatedImage: dto.generatedImage,
      generatedVideo: dto.generatedVideo,
      platform: dto.platform,
      status: dto.status || 'draft',
      brandId: dto.brandId,
    });

    return this.contentRepository.save(content);
  }

  async getContent(userId: string, filter?: string, page: number = 1, limit: number = 12) {
    const where: any = { userId };

    if (filter && filter !== 'all') {
      where.status = filter;
    }

    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = Number.isNaN(limit) || limit < 1 ? 12 : Math.min(limit, 50);

    const content = await this.contentRepository.find({
      where,
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      relations: ['brand', 'analytics'],
    });

    return content;
  }

  async getContentById(userId: string, contentId: string) {
    return this.contentRepository.findOne({
      where: { id: contentId, userId },
      relations: ['brand', 'analytics'],
    });
  }

  async deleteContent(userId: string, contentId: string) {
    return this.contentRepository.delete({ id: contentId });
  }

  async scheduleContent(userId: string, contentId: string, scheduledAt: Date) {
    await this.contentRepository.update(
      { id: contentId },
      {
        status: 'scheduled',
        scheduledAt,
      }
    );
    
    return this.getContentById(userId, contentId);
  }

  async getDashboardStats(userId: string) {
    try {
      // Load user content once so status counting is consistent with Recent Content
      const allContent = await this.contentRepository.find({
        where: { userId },
        relations: ['brand', 'analytics'],
        order: { createdAt: 'DESC' },
      });

      const totalContent = allContent.length;
      const draftedContent = allContent.filter(
        (c) => c.status?.toLowerCase() === 'draft',
      ).length;
      const scheduledContent = allContent.filter(
        (c) => c.status?.toLowerCase() === 'scheduled',
      ).length;
      const publishedContent = allContent.filter(
        (c) => c.status?.toLowerCase() === 'published',
      ).length;

      // Recent content: last 5 by createdAt
      const recentContent = allContent.slice(0, 5);

      // Calculate analytics totals (mock data for now)
      const totalViews = recentContent.reduce((sum, content) => {
        return sum + (content.analytics?.reduce((acc, analytic) => acc + (analytic.views || 0), 0) || 0);
      }, 0);

      const totalLikes = recentContent.reduce((sum, content) => {
        return sum + (content.analytics?.reduce((acc, analytic) => acc + (analytic.likes || 0), 0) || 0);
      }, 0);

      const totalShares = recentContent.reduce((sum, content) => {
        return sum + (content.analytics?.reduce((acc, analytic) => acc + (analytic.shares || 0), 0) || 0);
      }, 0);

      return {
        totalContent,
        draftedContent,
        scheduledContent,
        publishedContent,
        totalViews,
        totalLikes,
        totalShares,
        recentContent,
      };
    } catch (error: any) {
      console.error('getDashboardStats error:', {
        userId,
        message: error?.message,
        stack: error?.stack,
      });
      throw error;
    }
  }
}
