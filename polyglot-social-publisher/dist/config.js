"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
class ConfigManager {
    constructor() {
        this.configDir = (0, path_1.join)((0, os_1.homedir)(), '.polyglot');
        this.configPath = (0, path_1.join)(this.configDir, 'config.json');
        this.ensureConfigDir();
    }
    ensureConfigDir() {
        if (!(0, fs_1.existsSync)(this.configDir)) {
            (0, fs_1.mkdirSync)(this.configDir, { mode: 0o700 });
        }
    }
    saveConfig(config) {
        const existingConfig = this.loadConfig();
        const updatedConfig = Object.assign(Object.assign({}, existingConfig), config);
        (0, fs_1.writeFileSync)(this.configPath, JSON.stringify(updatedConfig, null, 2), {
            mode: 0o600, // Read/write for owner only
            encoding: 'utf-8'
        });
    }
    loadConfig() {
        try {
            if ((0, fs_1.existsSync)(this.configPath)) {
                const config = JSON.parse((0, fs_1.readFileSync)(this.configPath, 'utf-8'));
                return config;
            }
        }
        catch (error) {
            console.error('Error reading config:', error);
        }
        return {};
    }
    clearConfig() {
        if ((0, fs_1.existsSync)(this.configPath)) {
            (0, fs_1.writeFileSync)(this.configPath, '{}', {
                mode: 0o600,
                encoding: 'utf-8'
            });
        }
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFBd0U7QUFDeEUsMkJBQTZCO0FBQzdCLCtCQUE0QjtBQUc1QixNQUFhLGFBQWE7SUFJeEI7UUFDRSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUEsV0FBSSxFQUFDLElBQUEsWUFBTyxHQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRU8sZUFBZTtRQUNyQixJQUFJLENBQUMsSUFBQSxlQUFVLEVBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDaEMsSUFBQSxjQUFTLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLENBQUM7SUFDSCxDQUFDO0lBRUQsVUFBVSxDQUFDLE1BQTJCO1FBQ3BDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6QyxNQUFNLGFBQWEsbUNBQVEsY0FBYyxHQUFLLE1BQU0sQ0FBRSxDQUFDO1FBRXZELElBQUEsa0JBQWEsRUFBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRTtZQUNyRSxJQUFJLEVBQUUsS0FBSyxFQUFFLDRCQUE0QjtZQUN6QyxRQUFRLEVBQUUsT0FBTztTQUNsQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsVUFBVTtRQUNSLElBQUksQ0FBQztZQUNILElBQUksSUFBQSxlQUFVLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBQSxpQkFBWSxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsT0FBTyxNQUFNLENBQUM7WUFDaEIsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBQ0QsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksSUFBQSxlQUFVLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDaEMsSUFBQSxrQkFBYSxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFO2dCQUNuQyxJQUFJLEVBQUUsS0FBSztnQkFDWCxRQUFRLEVBQUUsT0FBTzthQUNsQixDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBOUNELHNDQThDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHdyaXRlRmlsZVN5bmMsIHJlYWRGaWxlU3luYywgZXhpc3RzU3luYywgbWtkaXJTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgaG9tZWRpciB9IGZyb20gJ29zJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IFB1Ymxpc2hlckNvbmZpZyB9IGZyb20gJy4vcHVibGlzaGVyJztcblxuZXhwb3J0IGNsYXNzIENvbmZpZ01hbmFnZXIge1xuICBwcml2YXRlIGNvbmZpZ0Rpcjogc3RyaW5nO1xuICBwcml2YXRlIGNvbmZpZ1BhdGg6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbmZpZ0RpciA9IGpvaW4oaG9tZWRpcigpLCAnLnBvbHlnbG90Jyk7XG4gICAgdGhpcy5jb25maWdQYXRoID0gam9pbih0aGlzLmNvbmZpZ0RpciwgJ2NvbmZpZy5qc29uJyk7XG4gICAgdGhpcy5lbnN1cmVDb25maWdEaXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgZW5zdXJlQ29uZmlnRGlyKCk6IHZvaWQge1xuICAgIGlmICghZXhpc3RzU3luYyh0aGlzLmNvbmZpZ0RpcikpIHtcbiAgICAgIG1rZGlyU3luYyh0aGlzLmNvbmZpZ0RpciwgeyBtb2RlOiAwbzcwMCB9KTtcbiAgICB9XG4gIH1cblxuICBzYXZlQ29uZmlnKGNvbmZpZzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQge1xuICAgIGNvbnN0IGV4aXN0aW5nQ29uZmlnID0gdGhpcy5sb2FkQ29uZmlnKCk7XG4gICAgY29uc3QgdXBkYXRlZENvbmZpZyA9IHsgLi4uZXhpc3RpbmdDb25maWcsIC4uLmNvbmZpZyB9O1xuICAgIFxuICAgIHdyaXRlRmlsZVN5bmModGhpcy5jb25maWdQYXRoLCBKU09OLnN0cmluZ2lmeSh1cGRhdGVkQ29uZmlnLCBudWxsLCAyKSwge1xuICAgICAgbW9kZTogMG82MDAsIC8vIFJlYWQvd3JpdGUgZm9yIG93bmVyIG9ubHlcbiAgICAgIGVuY29kaW5nOiAndXRmLTgnXG4gICAgfSk7XG4gIH1cblxuICBsb2FkQ29uZmlnKCk6IFB1Ymxpc2hlckNvbmZpZyB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChleGlzdHNTeW5jKHRoaXMuY29uZmlnUGF0aCkpIHtcbiAgICAgICAgY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShyZWFkRmlsZVN5bmModGhpcy5jb25maWdQYXRoLCAndXRmLTgnKSk7XG4gICAgICAgIHJldHVybiBjb25maWc7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJlYWRpbmcgY29uZmlnOicsIGVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgY2xlYXJDb25maWcoKTogdm9pZCB7XG4gICAgaWYgKGV4aXN0c1N5bmModGhpcy5jb25maWdQYXRoKSkge1xuICAgICAgd3JpdGVGaWxlU3luYyh0aGlzLmNvbmZpZ1BhdGgsICd7fScsIHtcbiAgICAgICAgbW9kZTogMG82MDAsXG4gICAgICAgIGVuY29kaW5nOiAndXRmLTgnXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn0gIl19