import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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

  constructor(private configService: ConfigService) {
    this.ollamaBaseUrl = this.configService.get('OLLAMA_BASE_URL') || 'http://localhost:11434';
    this.ollamaModel = this.configService.get('OLLAMA_MODEL') || 'phi3:mini';

    this.imageApiBaseUrl = 'http://54.88.119.163:7860';

    this.hfToken = this.configService.get<string>('HUGGINGFACE_API_TOKEN')!;
    this.hfDefaultTextModel =
      this.configService.get<string>('HF_TEXT_MODEL') || 'HuggingFaceH4/zephyr-7b-beta';
    this.hfDefaultImageModel =
      this.configService.get<string>('HF_IMAGE_MODEL') || 'stabilityai/sdxl-turbo';
  }

  /* ----------------------------------------------------------
      TEXT GENERATION (Local LLaMA via Ollama)
    ---------------------------------------------------------- */
  async generateText(
    prompt: string,
    model?: string,
    maxTokens: number = 500
  ): Promise<string> {
    // Use explicitly provided model or fall back to the default local model
    const modelId = model || this.ollamaModel || 'phi3:mini';

    try {
      const response = await axios.post(
        `${this.ollamaBaseUrl}/api/chat`,
        {
          model: modelId,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          stream: false,
          options: {
            // Ollama-specific generation options; maxTokens is a soft cap
            num_predict: maxTokens,
          },
        },
        {
          timeout: 120000,
        }
      );

      const data = response.data;

      // Support both the standard Ollama response shape and a generic one
      const text =
        data?.message?.content ||
        (Array.isArray(data?.choices) && data.choices[0]?.message?.content) ||
        (typeof data === 'string' ? data : null);

      if (!text?.trim()) {
        throw new Error('Empty response from local LLaMA text generation');
      }

      return text.trim();
    } catch (error: any) {
      this.logger.error('Local LLaMA text generation error', error.response?.data || error.message);
      throw new HttpException(
        `Failed to generate text content: ${
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Unknown error'
        }`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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

    return this.generateText(prompt, model, 300);
  }
}
