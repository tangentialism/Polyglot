import { PublisherConfig } from './publisher';
export declare class ConfigManager {
    private configDir;
    private configPath;
    constructor();
    private ensureConfigDir;
    saveConfig(config: Record<string, any>): void;
    loadConfig(): PublisherConfig;
    clearConfig(): void;
}
