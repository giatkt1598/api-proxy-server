import { readFileSync } from "fs";
import { createServer } from "https";
import express from "express";
import { getConfig } from "./utilities.js";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from 'cors';
const app = express();

app.use(cors({
    origin: true,
    credentials: true,
}))

const config = getConfig();
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
                proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie']

                for (let i = 0; i < proxyRes.headers['set-cookie']?.length ?? []; i++) {
                    let cookie = proxyRes.headers['set-cookie'][i]
                        .replace(/samesite\s*=\s*(lax|strict|none)/i, 'SameSite=None')
                    // .replace(/domain\s*=\s*[^;]+/i, 'Domain=localhost');


                    if (!/;\s*secure/i.test(cookie)) {
                        cookie += "; Secure"
                    }

                    proxyRes.headers['set-cookie'][i] = cookie;
                }
            }
        }
    })
)

const privateKey = readFileSync("./ssl/localhost.key", "utf8");
const certificate = readFileSync("./ssl/localhost.crt", "utf8");

createServer({ key: privateKey, cert: certificate }, app)
    .listen(config.proxyPort, () => {
        console.log(`Proxy server listening at https://localhost:${config.proxyPort}`);
    });


