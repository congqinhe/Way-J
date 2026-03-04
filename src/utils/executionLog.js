/**
 * 执行记录：用户对每个时间块的选择（按计划执行、休息、改做别的）
 * 供日程助手分析价值取向、成长路径，给出成长建议
 */
const STORAGE_KEY = 'rythom-execution-log';
const MAX_RECORDS = 200;

export const STATUS_LABELS = {
  done: '按计划执行',
  rest: '休息',
  changed: '改做别的',
};

/**
 * @param {object} record
 * @param {string} record.dateKey YYYY-MM-DD
 * @param {string} record.blockId
 * @param {string} record.title 细化标签，如 居家整备、深度输入
 * @param {string} record.category BlockCategory 枚举值，用于分组统计
 * @param {string} record.status 'done' | 'rest' | 'changed'
 * @param {number} record.weekday 0-6
 * @param {string} record.timeRange 如 "20:00–21:30"
 * @param {string} [record.changedTo] status=changed 时，细化标签（兼容旧数据）
 * @param {string} [record.changedCategory] status=changed 时，状态类别
 * @param {string} [record.changedDescription] status=changed 时，补充描述
 */
export function saveExecutionRecord(record) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const next = list.filter(
      (r) => !(r.dateKey === record.dateKey && r.blockId === record.blockId)
    );
    next.unshift({
      ...record,
      timestamp: Date.now(),
    });
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next.slice(0, MAX_RECORDS))
    );
  } catch (_) {}
}

/**
 * @param {number} [limit=50]
 * @returns {Array<{dateKey, blockId, title, category, status, weekday, timeRange}>}
 */
export function loadExecutionLog(limit = 50) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return list.slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * 生成供大模型使用的执行历史概要（纯文本）
 * @param {number} [limit=50]
 */
export function getExecutionHistorySummary(limit = 50) {
  const records = loadExecutionLog(limit);
  if (records.length === 0) return '';

  const lines = [
    '【用户过去执行记录】（系统实时提供，反映实际执行情况。可用于总结价值取向、成长路径、各类型占比，据此给成长建议。）',
    '',
  ];
  records.forEach((r) => {
    const [y, m, d] = (r.dateKey || '').split('-');
    const dateStr = m && d ? `${Number(m)}/${Number(d)}` : r.dateKey;
    const weekday = r.weekday != null ? ['日', '一', '二', '三', '四', '五', '六'][r.weekday] : '';
    const statusLabel = STATUS_LABELS[r.status] || r.status;
    const suffix = r.status === 'changed' && (r.changedTo || r.changedTag)
      ? ` 改做：${r.changedTo || r.changedTag}${r.changedCategory ? `（${r.changedCategory}）` : ''}${r.changedDescription ? ` ${r.changedDescription}` : ''}`
      : ` ${statusLabel}`;
    const timeStr = r.timeRange || '';
    lines.push(`- ${dateStr} 周${weekday} ${timeStr} ${r.title || ''}${suffix}`);
  });
  return lines.join('\n');
}
