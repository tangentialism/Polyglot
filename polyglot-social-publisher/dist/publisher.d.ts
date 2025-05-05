export type SocialNetwork = 'bluesky' | 'mastodon';
export interface PublisherConfig {
    bluesky?: {
        identifier: string;
        password: string;
    };
    mastodon?: {
        instance: string;
        accessToken: string;
    };
}
export interface PublishResult {
    success: boolean;
    error?: string;
    postId?: string;
    url?: string;
}
export interface PublishOptions {
    content: string;
    networks: SocialNetwork[];
}
export declare class Publisher {
    private config;
    constructor(config: PublisherConfig);
    publish(options: PublishOptions): Promise<Record<SocialNetwork, PublishResult>>;
    private postToBluesky;
    private postToMastodon;
}
