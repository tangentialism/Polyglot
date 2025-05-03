export interface MediaAttachment {
  url: string;
  type: 'image' | 'video' | 'audio';
  altText?: string;
}

export interface PostMetadata {
  title?: string;
  tags: string[];
  createdAt: Date;
  source: string;
  originalUrl?: string;
}

export interface Post {
  content: string;
  metadata: PostMetadata;
  attachments?: MediaAttachment[];
}

export interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  url?: string;
  error?: Error;
  timestamp: Date;
} 