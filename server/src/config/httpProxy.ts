import * as HttpsProxyAgent from 'https-proxy-agent';
import http from 'http';
import https from 'https';

/**
 * HTTP代理配置
 * 从环境变量获取代理设置，如果没有则使用默认值
 */
// 优先使用HTTP_PROXY环境变量，如果没有则使用PROXY_URL
const PROXY_URL = process.env.HTTP_PROXY || 
                  process.env.http_proxy || 
                  process.env.HTTPS_PROXY || 
                  process.env.https_proxy || 
                  process.env.PROXY_URL || 
                  null;

// 检查是否启用代理
const ENABLE_PROXY = process.env.ENABLE_PROXY === 'true' || !!PROXY_URL;

// 创建代理agent
const setupProxy = () => {
  if (ENABLE_PROXY && PROXY_URL) {
    console.log(`Using proxy: ${PROXY_URL}`);
    const proxyAgent = new HttpsProxyAgent.HttpsProxyAgent(PROXY_URL);
    
    // 为全局HTTP和HTTPS请求设置代理
    http.globalAgent = proxyAgent as unknown as http.Agent;
    https.globalAgent = proxyAgent as unknown as https.Agent;
    
    return true;
  } else {
    console.log('No HTTP proxy configured, using direct connection');
    return false;
  }
};

export default setupProxy; 