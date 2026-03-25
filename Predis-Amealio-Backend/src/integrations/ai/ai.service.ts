import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

type TextProvider = 'ollama' | 'openai' | 'hf';

export interface TextGenerationMeta {
  textModelUsed: string;
  fallbackUsed: boolean;
}

export interface TextGenerationResult {
  text: string;
  meta: TextGenerationMeta;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  // Legacy fields (kept for video generator / future use)
  private readonly ollamaBaseUrl: string;
  private readonly ollamaModel: string;
  private readonly imageApiBaseUrl: string;

  // Hugging Face configuration
  private readonly hfToken: string;
  private readonly hfDefaultTextModel: string;
  private readonly hfDefaultImageModel: string;
  private readonly openAiApiKey: string;
  private readonly openAiDefaultModel: string;

  constructor(private configService: ConfigService) {
    this.ollamaBaseUrl = this.configService.get('OLLAMA_BASE_URL') || 'http://localhost:11434';
    this.ollamaModel = this.configService.get('OLLAMA_MODEL') || 'phi3:mini';

    this.imageApiBaseUrl = 'http://54.88.119.163:7860';

    this.hfToken = this.configService.get<string>('HUGGINGFACE_API_TOKEN') || '';
    this.hfDefaultTextModel =
      this.configService.get<string>('HF_TEXT_MODEL') || 'HuggingFaceH4/zephyr-7b-beta';
    this.hfDefaultImageModel =
      this.configService.get<string>('HF_IMAGE_MODEL') || 'stabilityai/sdxl-turbo';
    this.openAiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.openAiDefaultModel = this.configService.get<string>('OPENAI_TEXT_MODEL') || 'gpt-4o-mini';
  }

  /* ----------------------------------------------------------
      TEXT GENERATION (Local LLaMA via Ollama)
    ---------------------------------------------------------- */
  private normalizeProvider(value?: string): TextProvider {
    const selected = (value || '').trim().toLowerCase();
    if (selected === 'gpt' || selected.startsWith('openai')) return 'openai';
    if (selected === 'hf' || selected === 'huggingface' || selected.startsWith('hf:')) return 'hf';
    return 'ollama';
  }

  private getTextFallbackChain(selectedModel?: string): TextProvider[] {
    const primary = this.normalizeProvider(selectedModel);
    if (primary === 'openai') return ['openai', 'ollama', 'hf'];
    if (primary === 'hf') return ['hf', 'openai', 'ollama'];
    return ['ollama', 'openai', 'hf'];
  }

  private resolveModelForProvider(provider: TextProvider, selectedModel?: string): string {
    const selected = (selectedModel || '').trim();
    const lower = selected.toLowerCase();

    if (provider === 'ollama') {
      if (selected && !['llama', 'gpt', 'openai', 'hf', 'huggingface'].includes(lower)) return selected;
      return this.ollamaModel || 'phi3:mini';
    }

    if (provider === 'openai') {
      if (selected.startsWith('openai:')) return selected.split(':').slice(1).join(':') || this.openAiDefaultModel;
      if (selected && lower.startsWith('gpt-')) return selected;
      if (selected && lower.startsWith('o')) return selected;
      return this.openAiDefaultModel;
    }

    if (selected.startsWith('hf:')) return selected.split(':').slice(1).join(':') || this.hfDefaultTextModel;
    return this.hfDefaultTextModel;
  }

  private parseTextResponse(data: any): string | null {
    const text =
      data?.message?.content ||
      (Array.isArray(data?.choices) && data.choices[0]?.message?.content) ||
      data?.generated_text ||
      (Array.isArray(data) && data[0]?.generated_text) ||
      (typeof data === 'string' ? data : null);
    return text?.trim() ? text.trim() : null;
  }

  private async generateWithOllama(prompt: string, modelId: string, maxTokens: number): Promise<string> {
    const response = await axios.post(
      `${this.ollamaBaseUrl}/api/chat`,
      {
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        options: { num_predict: maxTokens },
      },
      { timeout: 120000 },
    );

    const text = this.parseTextResponse(response.data);
    if (!text) throw new Error('Empty response from Ollama');
    return text;
  }

  private async generateWithOpenAI(prompt: string, modelId: string, maxTokens: number): Promise<string> {
    if (!this.openAiApiKey) throw new Error('OPENAI_API_KEY is not configured');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
      },
      {
        timeout: 90000,
        headers: {
          Authorization: `Bearer ${this.openAiApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const text = this.parseTextResponse(response.data);
    if (!text) throw new Error('Empty response from OpenAI');
    return text;
  }

  private async generateWithHuggingFace(prompt: string, modelId: string, maxTokens: number): Promise<string> {
    if (!this.hfToken) throw new Error('HUGGINGFACE_API_TOKEN is not configured');

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          return_full_text: false,
        },
      },
      {
        timeout: 120000,
        headers: {
          Authorization: `Bearer ${this.hfToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const text = this.parseTextResponse(response.data);
    if (!text) throw new Error('Empty response from Hugging Face');
    return text;
  }

  async generateText(prompt: string, model?: string, maxTokens: number = 500): Promise<TextGenerationResult> {
    const chain = this.getTextFallbackChain(model);
    const errors: string[] = [];

    for (let i = 0; i < chain.length; i++) {
      const provider = chain[i];
      const modelId = this.resolveModelForProvider(provider, model);

      try {
        let text: string;
        if (provider === 'ollama') {
          text = await this.generateWithOllama(prompt, modelId, maxTokens);
        } else if (provider === 'openai') {
          text = await this.generateWithOpenAI(prompt, modelId, maxTokens);
        } else {
          text = await this.generateWithHuggingFace(prompt, modelId, maxTokens);
        }

        return {
          text,
          meta: {
            textModelUsed: `${provider}:${modelId}`,
            fallbackUsed: i > 0,
          },
        };
      } catch (error: any) {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Unknown error';
        errors.push(`${provider}:${message}`);
        this.logger.warn(`Text generation failed for ${provider}:${modelId} -> ${message}`);
      }
    }

    throw new HttpException(
      `Failed to generate text content. Providers tried: ${errors.join(' | ')}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /* ----------------------------------------------------------
      IMAGE GENERATION (External text-to-image API)
    ---------------------------------------------------------- */
  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.imageApiBaseUrl}/generate-text-image`,
        { prompt },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 180000,
        }
      );

      const data = response.data;

      // Accept multiple common formats from the text-to-image service
      if (data?.image_url && typeof data.image_url === 'string') {
        return data.image_url;
      }

      if (data?.s3_url && typeof data.s3_url === 'string') {
        return data.s3_url;
      }

      if (data?.url && typeof data.url === 'string') {
        return data.url;
      }

      if (typeof data === 'string') {
        // If it's already a data URL or http(s) URL, return as-is
        if (data.startsWith('data:image') || data.startsWith('http')) {
          return data;
        }
        // Otherwise assume it's raw base64 image data
        return `data:image/png;base64,${data}`;
      }

      if (data?.image && typeof data.image === 'string') {
        const img = data.image;
        if (img.startsWith('data:image')) {
          return img;
        }
        return `data:image/png;base64,${img}`;
      }

      if (Array.isArray(data?.images) && typeof data.images[0] === 'string') {
        const first = data.images[0];
        if (first.startsWith('data:image') || first.startsWith('http')) {
          return first;
        }
        return `data:image/png;base64,${first}`;
      }

      throw new Error(
        `Unexpected response format from text-to-image API: ${JSON.stringify(data).slice(0, 500)}`,
      );
    } catch (error: any) {
      this.logger.error('Text-to-image generation error', error.response?.data || error.message);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to generate image';

      throw new HttpException(
        `Image generation failed: ${message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /* ----------------------------------------------------------
      VIDEO GENERATION (Text → Video API)
  ---------------------------------------------------------- */
  async generateTextToVideo(prompt: string, durationSeconds?: number): Promise<string> {
    const payload: Record<string, unknown> = { prompt };

    if (durationSeconds) {
      payload.duration = durationSeconds;
    }

    try {
      const response = await axios.post(
        'https://textvideogenerator.amealio.com/generate',
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 180000,
        }
      );

      const data = response.data;

      // 1) Plain string response (URL or data URI)
      if (typeof data === 'string') {
        return data;
      }

      // 2) Direct properties on the root object
      if (data) {
        if (typeof data.video_url === 'string') return data.video_url;
        if (typeof data.url === 'string') return data.url;
        if (typeof data.video === 'string') {
          const v = data.video;
          if (v.startsWith('data:video')) return v;
          if (v.startsWith('http')) return v;
          return `data:video/mp4;base64,${v}`;
        }

        // Common generic keys (result, data, output)
        if (typeof data.result === 'string') return data.result;
        if (typeof data.data === 'string') return data.data;
        if (typeof data.output === 'string') return data.output;

        // Nested under .data or .payload
        if (data.data && typeof data.data === 'object') {
          const inner = data.data;
          if (typeof inner.video_url === 'string') return inner.video_url;
          if (typeof data.s3_url === 'string') return data.s3_url; //
          if (typeof inner.url === 'string') return inner.url;
          if (typeof inner.video === 'string') {
            const v = inner.video;
            if (v.startsWith('data:video')) return v;
            if (v.startsWith('http')) return v;
            return `data:video/mp4;base64,${v}`;
          }
        }

        if (data.payload && typeof data.payload === 'object') {
          const inner = data.payload;
          if (typeof inner.url === 'string') return inner.url;
          if (typeof data.s3_url === 'string') return data.s3_url; //

          if (typeof inner.video_url === 'string') return inner.video_url;
        }

        // 3) Array responses – pick first string-like entry
        if (Array.isArray(data) && typeof data[0] === 'string') {
          return data[0];
        }

        if (Array.isArray(data.results) && typeof data.results[0] === 'string') {
          return data.results[0];
        }
      }

      throw new Error(
        `Unexpected response format from video generator: ${
          typeof data === 'object' ? JSON.stringify(data).slice(0, 500) : String(data)
        }`,
      );
    } catch (error: any) {
      console.error('AI Video Generation Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      const base = error.response?.data ?? {};

      const errorMessage =
        base.message ||
        base.detail ||
        base.error ||
        error.message ||
        'Failed to generate video';

      throw new HttpException(
        `Video generation failed: ${errorMessage}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /* ----------------------------------------------------------
      SOCIAL MEDIA POST GENERATION (uses HF text)
    ---------------------------------------------------------- */
  async generateSocialMediaPost(
    topic: string,
    platform: string,
    tone: string = 'professional',
    model?: string,
    outputType: 'caption' | 'hashtags' | 'summary' | 'generic' = 'generic'
  ): Promise<string> {
    const platformGuidelines = {
      instagram: 'Keep it visual and engaging with emojis. Max 2200 characters. Include hashtags.',
      facebook: 'Conversational and community-focused.',
      linkedin: 'Professional and value-driven.',
      twitter: 'Concise & impactful. Max 280 characters.',
      tiktok: 'Fun, trendy, with a CTA.',
    };

    const guidelines =
      platformGuidelines[platform.toLowerCase()] || 'Create engaging content';

    let outputInstructions: string;

    switch (outputType) {
      case 'caption':
        outputInstructions = [
          'Generate ONLY 3-5 short Instagram-style captions.',
          'Return one caption per line.',
          'Do not include any extra text, labels, or explanations.',
        ].join(' ');
        break;
      case 'hashtags':
        outputInstructions = [
          'Generate ONLY hashtags relevant to the topic.',
          'Return them on a single line separated by spaces.',
          'Do not include any other words, sentences, or explanations.',
        ].join(' ');
        break;
      case 'summary':
        outputInstructions = [
          'Provide ONLY a concise summary suitable for this platform.',
          "Do not add any preamble such as 'Here is the summary'.",
        ].join(' ');
        break;
      case 'generic':
      default:
        outputInstructions = 'Write a complete social media post following the guidelines above.';
        break;
    }

    const prompt = `
You are a social media content assistant.

Platform: ${platform}
Tone: ${tone}
Topic: ${topic}
Guidelines: ${guidelines}

${outputInstructions}
`;

    const result = await this.generateText(prompt, model, 300);
    return result.text;
  }
}
