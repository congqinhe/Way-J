/**
 * 智谱 AI 开放平台 Chat Completions API
 * 文档: https://open.bigmodel.cn/dev/api
 */
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const STORAGE_KEY = 'rythom-zhipu-api-key';

export function getApiKey() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setApiKey(key) {
  if (typeof window === 'undefined') return;
  if (key == null || String(key).trim() === '') {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, String(key).trim());
  }
}

export function hasApiKey() {
  const key = getApiKey();
  return key != null && key.length > 0;
}

/**
 * 调用智谱 chat completions（非流式）
 * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages
 * @returns {Promise<string>} 助手回复内容
 */
export async function chat(messages) {
  let fullContent = '';
  await chatStream(messages, (chunk) => { fullContent += chunk; });
  return fullContent;
}

/**
 * 调用智谱 chat completions（流式）
 * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages
 * @param {(chunk: string) => void} onChunk 每收到一小段文本时回调
 * @returns {Promise<string>} 完整回复内容
 */
export async function chatStream(messages, onChunk) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('请先设置智谱 AI API Key');
  }

  const res = await fetch(ZHIPU_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    let msg = `请求失败 (${res.status})`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error?.message) msg = errJson.error.message;
    } catch (_) {
      if (errText) msg = errText.slice(0, 200);
    }
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const obj = JSON.parse(data);
          const chunk = obj.choices?.[0]?.delta?.content;
          if (chunk) {
            fullContent += chunk;
            onChunk(chunk);
          }
        } catch (_) {}
      }
    }
  }
  if (buffer) {
    const line = buffer.trim();
    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
      try {
        const obj = JSON.parse(line.slice(6));
        const chunk = obj.choices?.[0]?.delta?.content;
        if (chunk) {
          fullContent += chunk;
          onChunk(chunk);
        }
      } catch (_) {}
    }
  }

  return fullContent;
}
