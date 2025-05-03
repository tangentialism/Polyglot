import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { PublisherConfig } from './publisher';

export class ConfigManager {
  private configDir: string;
  private configPath: string;

  constructor() {
    this.configDir = join(homedir(), '.polyglot');
    this.configPath = join(this.configDir, 'config.json');
    this.ensureConfigDir();
  }

  private ensureConfigDir(): void {
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { mode: 0o700 });
    }
  }

  saveConfig(config: Record<string, any>): void {
    const existingConfig = this.loadConfig();
    const updatedConfig = { ...existingConfig, ...config };
    
    writeFileSync(this.configPath, JSON.stringify(updatedConfig, null, 2), {
      mode: 0o600, // Read/write for owner only
      encoding: 'utf-8'
    });
  }

  loadConfig(): PublisherConfig {
    try {
      if (existsSync(this.configPath)) {
        const config = JSON.parse(readFileSync(this.configPath, 'utf-8'));
        return config;
      }
    } catch (error) {
      console.error('Error reading config:', error);
    }
    return {};
  }

  clearConfig(): void {
    if (existsSync(this.configPath)) {
      writeFileSync(this.configPath, '{}', {
        mode: 0o600,
        encoding: 'utf-8'
      });
    }
  }
} 