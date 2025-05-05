declare module 'mastodon-api' {
  interface MastodonConfig {
    access_token: string;
    api_url: string;
  }

  interface MastodonResponse {
    data: {
      id: string;
      [key: string]: any;
    };
  }

  class Mastodon {
    constructor(config: MastodonConfig);
    post(endpoint: string, params: any): Promise<MastodonResponse>;
    get(endpoint: string, params?: any): Promise<MastodonResponse>;
  }

  export = Mastodon;
} 