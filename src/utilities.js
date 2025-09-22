import fs from 'fs';

/**
 * @typedef {Object} AppConfig
 * @property {number} proxyPort
 * @property {Object} requestHeaders
 * @property {Object} responseHeaders
 * @property {boolean} ssl
 * @property {{[port: string]: string}} mappingPorts
 */

/**
 * 
 * @returns {AppConfig}
 */
export const getConfig = () => {
    const str = fs.readFileSync('./app.config.json', 'utf-8');

    /**
     * @type {AppConfig}
     */
    const config = JSON.parse(str);
    return config;
} 