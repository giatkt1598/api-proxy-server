import { readFileSync } from "fs";
import { createServer } from "https";
import express from "express";
import { getConfig } from "./utilities.js";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from 'cors';
import path from "path";

const config = getConfig();

/**
 * @param {string} port 
 * @param {string} pathRewrite 
 */
function runServer(port, pathRewrite = '/') {

    const app = express();
    app.use(cors({
        origin: true,
        credentials: true,
    }))

    app.use(
        '/',
        createProxyMiddleware({
            target: config.originUrl,
            changeOrigin: true,
            secure: false,
            headers: config.headers,
            cookieDomainRewrite: 'localhost',
            on: {
                proxyRes: (proxyRes, req, res) => {
                    for (let i = 0; i < proxyRes.headers['set-cookie']?.length ?? []; i++) {
                        let cookie = proxyRes.headers['set-cookie'][i]
                            .replace(/samesite\s*=\s*(lax|strict|none)/i, 'SameSite=None')
                            .replace(/;\s*Secure/gi, "");
                        proxyRes.headers['set-cookie'][i] = cookie;
                    }

                    for (const headerKey of Object.keys(config.responseHeaders)) {
                        proxyRes.headers[headerKey] = config.responseHeaders[headerKey];
                    }
                }
            },
            pathRewrite: (reqPath) => path.posix.join(pathRewrite, reqPath),
        })
    )


    const notifyServerStarted = () => {
        console.log(`Proxy server listening at ${config.ssl ? 'https' : 'http'}://localhost:${port} -> ${config.originUrl}${pathRewrite === '/' ? '' : pathRewrite}`);
    }

    if (config.ssl) {
        const privateKey = config.ssl ? readFileSync("./ssl/localhost.key", "utf8") : '';
        const certificate = config.ssl ? readFileSync("./ssl/localhost.crt", "utf8") : '';
        const server = createServer({
            key: config.ssl ? privateKey : undefined,
            cert: config.ssl ? certificate : undefined,
        }, app);
        server.listen(port, notifyServerStarted);
    } else {
        app.listen(port, notifyServerStarted);
    }
}

for (const port of Object.keys(config.mappingPorts)) {
    runServer(port, config.mappingPorts[port]);
}
