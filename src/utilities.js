import fs from 'fs';

/**
 * @typedef {Object} AppConfig
 * @property {string} originUrl
 * @property {number} proxyPort
 * @property {Object} headers
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