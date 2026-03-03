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
  FREE: 'free',
};

// 核心时间块定义（固定模板）
export const scheduleBlocks = [
  // 工作日早间地铁 7:30–8:10
  ...[1, 3, 5].map((weekday) => ({
    id: `morning-${weekday}`,
    weekday,
    start: time(7, 30),
    end: time(8, 10),
    category: BlockCategory.MORNING_COMMUTE,
    title: '早间地铁 · AI/产品方法阅读',
    description:
      '适合：阅读专业内容、看行业报告、做结构笔记、听高密度播客。\n不适合：刷碎片、社交、卖衣服、回无意义消息。',
  })),
  ...[2, 4].map((weekday) => ({
    id: `morning-${weekday}`,
    weekday,
    start: time(7, 30),
    end: time(8, 10),
    category: BlockCategory.MORNING_COMMUTE,
    title: '早间地铁 · 自我成长/行业趋势',
    description:
      '适合：自我成长类书籍、行业趋势文章、结构化记录。\n不适合：刷碎片、无目的社交。',
  })),

  // 工作时间（只记录）
  ...[1, 2, 3, 4, 5].flatMap((weekday) => [
    {
      id: `work-am-${weekday}`,
      weekday,
      start: time(9, 0),
      end: time(11, 0),
      category: BlockCategory.WORK,
      title: '工作（记录）',
      description: '固定工作时间，仅作为时间背景记录。',
    },
    {
      id: `work-pm-${weekday}`,
      weekday,
      start: time(13, 0),
      end: time(17, 30),
      category: BlockCategory.WORK,
      title: '工作（记录）',
      description: '固定工作时间，仅作为时间背景记录。',
    },
  ]),

  // 晚间地铁 18:30–19:10
  {
    id: 'evening-1',
    weekday: 1,
    start: time(18, 30),
    end: time(19, 10),
    category: BlockCategory.EVENING_COMMUTE,
    title: '晚间地铁 · 本周工作优先级梳理',
    description:
      '认知下降，不做重学习。用 10 分钟梳理本周工作优先级，余下时间轻松放松（音乐/随意看）。',
  },
  {
    id: 'evening-3',
    weekday: 3,
    start: time(18, 30),
    end: time(19, 10),
    category: BlockCategory.EVENING_COMMUTE,
    title: '晚间地铁 · 项目风险扫描',
    description:
      '认知下降，不做重学习。用 10 分钟扫一眼项目风险点，余下时间轻松放松。',
  },
  {
    id: 'evening-5',
    weekday: 5,
    start: time(18, 30),
    end: time(19, 10),
    category: BlockCategory.EVENING_COMMUTE,
    title: '晚间地铁 · 一周复盘',
    description: '简单回顾本周：做了什么、有什么情绪、下一周想调整什么。',
  },
  ...[2, 4].map((weekday) => ({
    id: `evening-${weekday}`,
    weekday,
    start: time(18, 30),
    end: time(19, 10),
    category: BlockCategory.EVENING_COMMUTE,
    title: '晚间地铁 · 轻松放松',
    description: '认知下降时段，不做重学习。可以听音乐、随意看看，不做自责。',
  })),

  // 晚上 20:00–22:00
  // 周一 / 周三：成长夜
  ...[1, 3].flatMap((weekday) => [
    {
      id: `growth-main-${weekday}`,
      weekday,
      start: time(20, 0),
      end: time(21, 30),
      category: BlockCategory.DEEP_GROWTH,
      title: '成长夜 · 深度成长',
      description:
        '输出思考、写结构、做方法沉淀。本周仅两晚深度成长，不追求每天卓越，防止透支。',
    },
    {
      id: `growth-end-${weekday}`,
      weekday,
      start: time(21, 30),
      end: time(22, 0),
      category: BlockCategory.RELAX,
      title: '成长夜 · 放松收尾',
      description: '用 30 分钟做温和收尾，例如拉伸、轻阅读、准备睡前状态。',
    },
  ]),

  // 周二 / 周四：关系夜
  ...[2, 4].map((weekday) => ({
    id: `relationship-${weekday}`,
    weekday,
    start: time(20, 0),
    end: time(22, 0),
    category: BlockCategory.RELATIONSHIP,
    title: '关系夜 · 陪伴与互动',
    description: '陪伴孩子、聊天、家庭互动。保障情感流动，而不是被消耗在无目的刷手机中。',
  })),

  // 周五：松弛夜
  {
    id: 'relax-5',
    weekday: 5,
    start: time(20, 0),
    end: time(22, 0),
    category: BlockCategory.RELAX,
    title: '松弛夜 · 无压力休息',
    description: '完全不安排成长。可以看剧、发呆，关键是“无负担感”，为防止 burnout。',
  },

  // 周六
  {
    id: 'life-6-morning',
    weekday: 6,
    start: time(9, 0),
    end: time(11, 0),
    category: BlockCategory.LIFE_MAINTENANCE,
    title: '生活维护 · 集中处理',
    description:
      '整理衣柜、空间重置、财务处理等，一次性集中处理，避免工作日晚上被这些小事分散焦虑。',
  },
  {
    id: 'weekend-6-afternoon',
    weekday: 6,
    start: time(13, 30),
    end: time(18, 0),
    category: BlockCategory.RELATIONSHIP,
    title: '周六下午 · 陪伴时间',
    description: '半天陪伴家人或重要他人，保证高质量在场。',
  },
  {
    id: 'weekend-6-night',
    weekday: 6,
    start: time(19, 30),
    end: time(22, 0),
    category: BlockCategory.FREE,
    title: '周六晚上 · 自由时间',
    description: '不做刚性安排，允许自己随心所欲地放松或做感兴趣的事。',
  },

  // 周日
  {
    id: 'growth-7-morning',
    weekday: 0, // 周日
    start: time(9, 0),
    end: time(12, 0),
    category: BlockCategory.WEEKEND_GROWTH,
    title: '周日早上 · 3 小时深度成长',
    description: '本周最大成长块。可以做系统学习、输出、项目推进等高价值任务。',
  },
  {
    id: 'weekend-7-afternoon',
    weekday: 0,
    start: time(13, 30),
    end: time(18, 0),
    category: BlockCategory.RELAX,
    title: '周日下午 · 休闲',
    description: '允许自己放松、充电，不做过度功利化安排。',
  },
  {
    id: 'weekend-7-night-planning',
    weekday: 0,
    start: time(20, 30),
    end: time(21, 0),
    category: BlockCategory.WEEKEND_PLANNING,
    title: '周日晚 · 下周规划 30 分钟',
    description:
      '回顾本周执行情况，写出下周几个关键关注点。只需简短，不做冗长反省。',
  },
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

  lines.push('原则：成长夜每周只安排 2 次；生活维护集中处理不分散；不过度塞满，留出松弛与情感流动。');
  return lines.join('\n');
}

