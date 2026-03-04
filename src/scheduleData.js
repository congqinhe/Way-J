export const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function time(h, m = 0) {
  return { hour: h, minute: m };
}

export const BlockCategory = {
  MORNING_COMMUTE: 'morning_commute',
  EVENING_COMMUTE: 'evening_commute',
  DEEP_GROWTH: 'deep_growth',
  RELATIONSHIP: 'relationship',
  RELAX: 'relax',
  LIFE_MAINTENANCE: 'life_maintenance',
  WORK: 'work',
  WEEKEND_GROWTH: 'weekend_growth',
  WEEKEND_PLANNING: 'weekend_planning',
  PHYSICAL: 'physical',
  FREE: 'free',
};

/** 状态类别：5 个高层分类，用于 badge 展示，与细化标签（title）区分 */
export const StatusCategory = {
  RECOVER: '恢复',
  STRATEGY: '战略思考',
  EXECUTE: '落地执行',
  PHYSICAL: '体能增强',
  RELATIONSHIP: '关系',
  FREE: '自由时间',
};

/** 状态类别 → 可选细化标签（用于「改做别的」选择） */
export const CATEGORY_TAGS = {
  [StatusCategory.RECOVER]: ['居家整备', '空白转场', '工位早餐', '午间回血', '通勤泄压', '晚间补给', '居家/转场', '灵感捕捉', '兴趣娱乐'],
  [StatusCategory.STRATEGY]: ['深度输入', '灵感捕捉', '碎片输入', '复盘规划'],
  [StatusCategory.EXECUTE]: ['职业工作', '个人成长', '生活处理'],
  [StatusCategory.PHYSICAL]: ['身体维护', '系统训练'],
  [StatusCategory.RELATIONSHIP]: ['同行交流', '社交互动', '家庭陪伴'],
  [StatusCategory.FREE]: ['自由时间'],
};

// 核心时间块定义（固定模板）
// 工作日：周一/三/五 (高能产出日)、周二/四 (蓄能平衡日)、周六 (生活维护日)、周日 (战略规划日)
export const scheduleBlocks = [
  // ========== 周一 / 三 / 五 (高能产出日) ==========
  // 数据结构：title=细化标签，statusCategory=状态类别
  ...[1, 3, 5].flatMap((weekday) => [
    { id: `recover-${weekday}-06`, weekday, start: time(6, 0), end: time(7, 0), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '居家整备', description: '起床、洗漱、整理个人仪表，简单收拾居家环境，为出门做好准备' },
    { id: `recover-${weekday}-07a`, weekday, start: time(7, 0), end: time(7, 30), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '空白转场', description: '步行、换乘，利用物理位移时间做呼吸调整或简单心理预热' },
    { id: `growth-${weekday}-0730`, weekday, start: time(7, 30), end: time(8, 30), category: BlockCategory.DEEP_GROWTH, statusCategory: StatusCategory.STRATEGY, title: '深度输入', description: '深度英语学习或严肃阅读，专注获取高价值信息，培养思考习惯' },
    { id: `recover-${weekday}-0830`, weekday, start: time(8, 30), end: time(9, 0), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '工位早餐', description: '在工位补充能量，慢慢调整工作心态，做好软启动' },
    { id: `work-am-${weekday}`, weekday, start: time(9, 0), end: time(11, 0), category: BlockCategory.WORK, statusCategory: StatusCategory.EXECUTE, title: '职业工作', description: '专注推进核心工作任务，处理优先级高的事项并产出可交付成果' },
    { id: `recover-${weekday}-11`, weekday, start: time(11, 0), end: time(13, 0), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '午间回血', description: '午餐、午休，彻底放松身心，为下午高强度工作蓄能' },
    { id: `work-pm-${weekday}`, weekday, start: time(13, 0), end: time(17, 30), category: BlockCategory.WORK, statusCategory: StatusCategory.EXECUTE, title: '职业工作', description: '深度执行核心工作，保持持续专注与产出' },
    { id: `recover-${weekday}-1730`, weekday, start: time(17, 30), end: time(18, 30), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '通勤泄压', description: '下班通勤，听音乐、阅读或小憩，让大脑与身体放松' },
    { id: `growth-${weekday}-1830`, weekday, start: time(18, 30), end: time(19, 30), category: BlockCategory.DEEP_GROWTH, statusCategory: StatusCategory.STRATEGY, title: '碎片输入', description: '利用零散时间吸收英语听力或行业资讯，点状积累信息' },
    { id: `recover-${weekday}-1930`, weekday, start: time(19, 30), end: time(20, 15), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '晚间补给', description: '晚餐与餐后小憩，身体能量回填，短暂休息恢复精神' },
    { id: `growth-${weekday}-2015`, weekday, start: time(20, 15), end: time(21, 45), category: BlockCategory.DEEP_GROWTH, statusCategory: StatusCategory.EXECUTE, title: '个人成长', description: '深度练习、技能打磨或作品产出，专注提升自身能力' },
    { id: `recover-${weekday}-2145`, weekday, start: time(21, 45), end: time(22, 0), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '居家整备', description: '睡前洗漱、整理次日所需物品，静心准备入睡' },
  ]),

  // ========== 周二 / 周四 (蓄能平衡日) ==========
  ...[2, 4].flatMap((weekday) => [
    { id: `recover-${weekday}-06`, weekday, start: time(6, 0), end: time(7, 30), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '居家/转场', description: '起床、居家整备，通勤换乘，慢慢从休息模式过渡到工作模式' },
    { id: `growth-${weekday}-0730`, weekday, start: time(7, 30), end: time(8, 30), category: BlockCategory.DEEP_GROWTH, statusCategory: StatusCategory.STRATEGY, title: '灵感捕捉', description: '随性阅读、逻辑推演或记录灵感，激活创造思维' },
    { id: `recover-${weekday}-0830`, weekday, start: time(8, 30), end: time(9, 0), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '工位早餐', description: '补充早餐，调整心态，轻松进入上午工作节奏' },
    { id: `work-am-${weekday}`, weekday, start: time(9, 0), end: time(11, 0), category: BlockCategory.WORK, statusCategory: StatusCategory.EXECUTE, title: '职业工作', description: '工作任务推进，完成关键事项，保持适度专注' },
    { id: `recover-${weekday}-11`, weekday, start: time(11, 0), end: time(13, 0), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '午间回血', description: '午餐、午休，彻底放松身心，为下午积蓄精力' },
    { id: `work-pm-${weekday}`, weekday, start: time(13, 0), end: time(17, 30), category: BlockCategory.WORK, statusCategory: StatusCategory.EXECUTE, title: '职业工作', description: '延续下午核心工作任务，高效推进与产出' },
    { id: `recover-${weekday}-1730`, weekday, start: time(17, 30), end: time(18, 30), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '通勤泄压', description: '下班通勤，消遣或小憩，放松一天积累的紧张感' },
    { id: `recover-${weekday}-1830`, weekday, start: time(18, 30), end: time(19, 30), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '灵感捕捉', description: '地铁通勤、听歌、发呆等方式，让大脑自由漂浮，彻底解压' },
    { id: `physical-${weekday}`, weekday, start: time(19, 30), end: time(20, 10), category: BlockCategory.PHYSICAL, statusCategory: StatusCategory.PHYSICAL, title: '身体维护', description: '快走、力量训练或拉伸，保持体能与身体活力' },
    { id: `recover-${weekday}-2010`, weekday, start: time(20, 10), end: time(20, 50), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '晚间补给', description: '晚餐、体力回填，轻松舒适为夜间活动蓄能' },
    { id: `relationship-${weekday}`, weekday, start: time(20, 50), end: time(22, 0), category: BlockCategory.RELATIONSHIP, statusCategory: StatusCategory.RELATIONSHIP, title: '同行交流', description: '与同行进行专业探讨、认知置换或经验交流，拓展视野' },
  ]),

  // ========== 周六 (生活维护日) ==========
  { id: 'recover-6-06', weekday: 6, start: time(6, 0), end: time(9, 0), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '居家整备', description: '自然醒、慢早餐、居家自理，轻松开始周末' },
  { id: 'physical-6', weekday: 6, start: time(9, 0), end: time(10, 0), category: BlockCategory.PHYSICAL, statusCategory: StatusCategory.PHYSICAL, title: '系统训练', description: '系统性健身，保持身体活力与健康' },
  { id: 'life-6', weekday: 6, start: time(10, 0), end: time(11, 0), category: BlockCategory.LIFE_MAINTENANCE, statusCategory: StatusCategory.EXECUTE, title: '生活处理', description: '家务整理、采购等生活杂事，保持生活秩序' },
  { id: 'recover-6-11', weekday: 6, start: time(11, 0), end: time(13, 30), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '午间回血', description: '慢午餐、午休，彻底放松身心' },
  { id: 'relationship-6', weekday: 6, start: time(13, 30), end: time(18, 0), category: BlockCategory.RELATIONSHIP, statusCategory: StatusCategory.RELATIONSHIP, title: '社交互动', description: '朋友聚餐、非职业社交维护，维系社会关系' },
  { id: 'recover-6-18', weekday: 6, start: time(18, 0), end: time(19, 30), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '晚间补给', description: '周末晚餐与自由休息，享受放松时光' },
  { id: 'recover-6-1930', weekday: 6, start: time(19, 30), end: time(22, 0), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '兴趣娱乐', description: '电影、游戏、刷剧等纯粹的兴趣活动，获得快乐与释放' },

  // ========== 周日 (战略规划日) ==========
  { id: 'recover-0-06', weekday: 0, start: time(6, 0), end: time(9, 0), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '居家整备', description: '充足睡眠、晨间唤醒，身体和精神完全恢复' },
  { id: 'growth-0-morning', weekday: 0, start: time(9, 0), end: time(12, 0), category: BlockCategory.WEEKEND_PLANNING, statusCategory: StatusCategory.STRATEGY, title: '复盘规划', description: '职业方向复盘、深度学习与长期策略思考，形成行动计划' },
  { id: 'recover-0-12', weekday: 0, start: time(12, 0), end: time(13, 30), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '午间回血', description: '午餐、午间充能，为下午活动蓄力' },
  { id: 'relationship-0', weekday: 0, start: time(13, 30), end: time(18, 0), category: BlockCategory.RELATIONSHIP, statusCategory: StatusCategory.RELATIONSHIP, title: '家庭陪伴', description: '陪伴家人，进行家庭沟通与情感维护' },
  { id: 'recover-0-18', weekday: 0, start: time(18, 0), end: time(20, 30), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '兴趣娱乐', description: '晚餐、休闲活动，为下周蓄能放松身心' },
  { id: 'growth-0-planning', weekday: 0, start: time(20, 30), end: time(21, 0), category: BlockCategory.WEEKEND_PLANNING, statusCategory: StatusCategory.STRATEGY, title: '复盘规划', description: '总结本周经验，确认下周节奏与目标' },
  { id: 'recover-0-21', weekday: 0, start: time(21, 0), end: time(22, 0), category: BlockCategory.RELAX, statusCategory: StatusCategory.RECOVER, title: '居家整备', description: '睡前准备、静心，为高质量睡眠做准备' },
];

// ---------- 用户覆盖层（确认后的日程调整） ----------
const OVERRIDES_STORAGE_KEY = 'rythom-schedule-overrides';

/** 标记为「已删除」的 override，用于取消模板中的固定块 */
export const REMOVED_OVERRIDE_TITLE = '__REMOVED__';

/** 根据 weekday 和 start 查找模板块，start 为 "HH:mm" 或 { hour, minute } */
export function findTemplateBlock(weekday, start) {
  let h;
  let m;
  if (typeof start === 'string') {
    const [hh, mm] = start.trim().split(':').map(Number);
    h = hh;
    m = mm ?? 0;
  } else if (start && typeof start.hour === 'number') {
    h = start.hour;
    m = start.minute ?? 0;
  } else {
    return null;
  }
  return scheduleBlocks.find(
    (b) => b.weekday === weekday && b.start.hour === h && b.start.minute === m
  ) || null;
}

/** 解析 "HH:mm" 为 { hour, minute } */
function parseTimeStr(str) {
  if (!str || typeof str !== 'string') return null;
  const [h, m] = str.trim().split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return { hour: h, minute: m ?? 0 };
}

/** 从 localStorage 读取用户覆盖列表，每项为 { weekday, start, end, title, description }，start/end 为 "HH:mm" */
export function loadOverrides() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(OVERRIDES_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** 写入用户覆盖列表 */
export function saveOverrides(overrides) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
  } catch (_) {}
}

/** 合并模板与覆盖：返回与 scheduleBlocks 同结构的区块列表；被覆盖的用用户数据，覆盖中多出的时段作为新增块追加 */
function getEffectiveBlocksList() {
  const overrides = loadOverrides();
  const merged = scheduleBlocks
    .map((block) => {
      const override = overrides.find((o) => {
        const s = parseTimeStr(o.start);
        return o.weekday === block.weekday && s && s.hour === block.start.hour && s.minute === block.start.minute;
      });
      if (!override) return block;
      if (override.title === REMOVED_OVERRIDE_TITLE) return null;
      return {
        ...block,
        title: override.title ?? block.title,
        description: override.description ?? block.description,
        statusCategory: block.statusCategory ?? StatusCategory.FREE,
      };
    })
    .filter(Boolean);

  const matched = new Set(
    overrides.filter((o) => {
      const s = parseTimeStr(o.start);
      return scheduleBlocks.some((b) => b.weekday === o.weekday && b.start.hour === s?.hour && b.start.minute === s?.minute);
    }).map((o) => `${o.weekday}-${parseTimeStr(o.start)?.hour ?? ''}-${parseTimeStr(o.start)?.minute ?? ''}`)
  );
  const extra = overrides.filter((o) => {
    if (o.title === REMOVED_OVERRIDE_TITLE) return false;
    const s = parseTimeStr(o.start);
    const key = `${o.weekday}-${s?.hour ?? ''}-${s?.minute ?? ''}`;
    return s && !matched.has(key);
  });

  const pad = (n) => String(Number(n) ?? 0).padStart(2, '0');
  const extraBlocks = extra.map((o) => {
    const start = parseTimeStr(o.start);
    const end = parseTimeStr(o.end || o.start);
    return {
      id: `override-${o.weekday}-${pad(start?.hour)}-${pad(start?.minute)}`,
      weekday: o.weekday,
      start: start ? { hour: start.hour, minute: start.minute } : { hour: 0, minute: 0 },
      end: end ? { hour: end.hour, minute: end.minute } : { hour: 0, minute: 0 },
      category: BlockCategory.FREE,
      statusCategory: StatusCategory.FREE,
      title: o.title || '自定义',
      description: o.description || '',
    };
  });

  const all = [...merged, ...extraBlocks];
  all.sort((a, b) => {
    if (a.weekday !== b.weekday) return a.weekday - b.weekday;
    const aMin = a.start.hour * 60 + a.start.minute;
    const bMin = b.start.hour * 60 + b.start.minute;
    return aMin - bMin;
  });
  return all;
}

export function getCurrentBlock(date = new Date()) {
  const blocks = getEffectiveBlocksList();
  const weekday = date.getDay();
  const hour = date.getHours();
  const minute = date.getMinutes();

  function isWithin(block) {
    const { start, end } = block;
    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;
    const nowMinutes = hour * 60 + minute;
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }

  const todaysBlocks = blocks.filter((b) => b.weekday === weekday);
  const current = todaysBlocks.find(isWithin);

  if (!current) return null;

  return current;
}

export function getBlocksByWeekday() {
  const blocks = getEffectiveBlocksList();
  const grouped = new Map();
  blocks.forEach((b) => {
    if (!grouped.has(b.weekday)) grouped.set(b.weekday, []);
    grouped.get(b.weekday).push(b);
  });

  grouped.forEach((list) => {
    list.sort((a, b) => {
      const aStart = a.start.hour * 60 + a.start.minute;
      const bStart = b.start.hour * 60 + b.start.minute;
      return aStart - bStart;
    });
  });

  return grouped;
}

const pad = (n) => String(Number(n) ?? 0).padStart(2, '0');
const timeStr = (t) => (t ? `${pad(t.hour)}:${pad(t.minute)}` : '');

/** 生成用于大模型 system 的日程概要（纯文本），基于实际数据（模板 + 用户已确认的覆盖项） */
export function getScheduleSummary() {
  const grouped = getBlocksByWeekday();
  const lines = [
    '【用户当前的实际一周日程】（以下由系统实时提供，是用户在「现在」「一周节奏」中看到的真实日程，含已确认的覆盖项。请严格以此为准，勿以对话历史中的讨论替代。）',
    '',
  ];

  for (let d = 0; d <= 6; d++) {
    const blocks = grouped.get(d) || [];
    if (blocks.length === 0) continue;
    const dayName = WEEKDAYS[d];
    const blockLines = blocks.map((b) => {
      const start = timeStr(b.start);
      const end = timeStr(b.end);
      return `  - ${start}–${end} ${b.title}`;
    });
    lines.push(`${dayName}（weekday=${d}）：`);
    lines.push(...blockLines);
    lines.push('');
  }

  lines.push('原则：周一三五高能产出、周二四蓄能平衡、周六生活维护、周日战略规划；不过度塞满，留出松弛与情感流动。');
  return lines.join('\n');
}
