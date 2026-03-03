const RYTHOM_UPDATE_REG = /\[RYTHOM_UPDATE\]\s*([\s\S]*?)\s*\[\/RYTHOM_UPDATE\]/i;
/** 用于移除不完整的 [RYTHOM_UPDATE] 块（如被截断、缺少闭合标签），避免原始 JSON 展示给用户 */
const RYTHOM_UPDATE_OPEN_REG = /\[RYTHOM_UPDATE\][\s\S]*/i;
const RYTHOM_READY_REG = /\[RYTHOM_READY\]/i;

/**
 * 从助手回复中解析出展示文案、日程更新载荷、以及是否「可加入计划」
 * @param {string} content
 * @returns {{ displayContent: string; updatePayload: object | null; hasReady: boolean }}
 */
export function parseScheduleUpdate(content) {
  if (!content || typeof content !== 'string') return { displayContent: content || '', updatePayload: null, hasReady: false };
  const hasReady = RYTHOM_READY_REG.test(content);
  let displayContent = content.replace(RYTHOM_READY_REG, '').trim();
  const match = displayContent.match(RYTHOM_UPDATE_REG);
  if (!match) {
    // 即使块不完整（如流式输出被截断），也移除 [RYTHOM_UPDATE] 及后续内容，避免展示原始 JSON
    displayContent = displayContent.replace(RYTHOM_UPDATE_OPEN_REG, '').trim();
    return { displayContent: displayContent.trim(), updatePayload: null, hasReady };
  }
  displayContent = displayContent.replace(RYTHOM_UPDATE_REG, '').trim();
  try {
    const payload = JSON.parse(match[1].trim());
    if (!payload || typeof payload.summary !== 'string') return { displayContent, updatePayload: null, hasReady };
    const changes = Array.isArray(payload.changes)
      ? payload.changes.filter(
          (c) => typeof c.weekday === 'number' && typeof c.start === 'string' && typeof c.title === 'string'
        )
      : [];
    const removals = Array.isArray(payload.removals)
      ? payload.removals.filter((r) => typeof r.weekday === 'number' && typeof r.start === 'string')
      : [];
    const pastRecords = Array.isArray(payload.pastRecords)
      ? payload.pastRecords.filter(
          (r) => typeof r.dateKey === 'string' && typeof r.start === 'string' && typeof r.title === 'string'
        )
      : [];
    if (changes.length === 0 && removals.length === 0 && pastRecords.length === 0) return { displayContent, updatePayload: null, hasReady };
    return {
      displayContent,
      updatePayload: { summary: payload.summary, changes, removals, pastRecords },
      hasReady,
    };
  } catch {
    return { displayContent, updatePayload: null, hasReady };
  }
}
