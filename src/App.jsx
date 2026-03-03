import React, { useMemo, useState, useRef, useEffect } from 'react';
import { getBlocksByWeekday, getCurrentBlock, getScheduleSummary, WEEKDAYS, BlockCategory, loadOverrides, saveOverrides, findTemplateBlock, REMOVED_OVERRIDE_TITLE } from './scheduleData.js';
import * as zhipu from './services/zhipu.js';
import { loadChatMessages, saveChatMessages } from './utils/chatStorage.js';
import { parseScheduleUpdate } from './utils/parseScheduleUpdate.js';
import { saveExecutionRecord, loadExecutionLog, getExecutionHistorySummary, STATUS_LABELS } from './utils/executionLog.js';

const STATUS_OPTIONS = [
  { key: 'done', label: '按计划执行了' },
  { key: 'rest', label: '今天改成休息' },
  { key: 'changed', label: '今天临时改做别的' },
];

function formatTimeRange(block) {
  const pad = (n) => String(n).padStart(2, '0');
  const { start, end } = block;
  return `${pad(start.hour)}:${pad(start.minute)}–${pad(end.hour)}:${pad(end.minute)}`;
}

function getCategoryTag(category) {
  switch (category) {
    case BlockCategory.MORNING_COMMUTE:
      return '轻深度输入';
    case BlockCategory.EVENING_COMMUTE:
      return '轻整理/复盘';
    case BlockCategory.DEEP_GROWTH:
      return '深度成长';
    case BlockCategory.RELATIONSHIP:
      return '关系/陪伴';
    case BlockCategory.RELAX:
      return '松弛休息';
    case BlockCategory.LIFE_MAINTENANCE:
      return '生活维护';
    case BlockCategory.WORK:
      return '工作记录';
    case BlockCategory.WEEKEND_GROWTH:
      return '周末深度成长';
    case BlockCategory.WEEKEND_PLANNING:
      return '规划';
    case BlockCategory.FREE:
    default:
      return '自由时间';
  }
}

function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getStatusStorageKey(dateKey, blockId) {
  return `rythom-status-${dateKey}-${blockId}`;
}

function loadStatus(dateKey, blockId) {
  if (typeof window === 'undefined') return null;
  const key = getStatusStorageKey(dateKey, blockId);
  return window.localStorage.getItem(key);
}

function saveStatus(dateKey, blockId, status) {
  if (typeof window === 'undefined') return;
  const key = getStatusStorageKey(dateKey, blockId);
  if (!status) {
    window.localStorage.removeItem(key);
  } else {
    window.localStorage.setItem(key, status);
  }
}

function CurrentBlockView() {
  const [now, setNow] = useState(() => new Date());
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [recordsExpanded, setRecordsExpanded] = useState(false);

  const currentBlock = useMemo(() => getCurrentBlock(now), [now, refreshFlag]);
  const dateKey = useMemo(() => getTodayKey(now), [now]);

  const status = currentBlock ? loadStatus(dateKey, currentBlock.id) : null;

  const handleStatusChange = (nextStatus) => {
    if (!currentBlock) return;
    saveStatus(dateKey, currentBlock.id, nextStatus);
    saveExecutionRecord({
      dateKey,
      blockId: currentBlock.id,
      title: currentBlock.title,
      category: currentBlock.category,
      status: nextStatus,
      weekday: currentBlock.weekday,
      timeRange: formatTimeRange(currentBlock),
    });
    setRefreshFlag((x) => x + 1);
  };

  const handleRefreshNow = () => {
    setNow(new Date());
    setRefreshFlag((x) => x + 1);
  };

  if (!currentBlock) {
    return (
      <div className="page">
        <header className="header">
          <h1 className="title">同道J人</h1>
          <button className="refresh-button" onClick={handleRefreshNow}>
            刷新
          </button>
        </header>
        <main className="content">
          <section className="card">
            <div className="card-header">
              <span className="badge badge-free">自由时间</span>
            </div>
            <h2 className="card-title">现在没有计划中的时间块</h2>
            <p className="card-text">
              当前不在你的固定节奏时间段里，这是你的自由时间。
              你可以选择休息、随心安排，或打开“一周节奏”看看下一段关键时间块。
            </p>
          </section>
          <section className="card card-collapsible">
            <button
              type="button"
              className="card-collapse-header"
              onClick={() => setRecordsExpanded((x) => !x)}
            >
              <h3 className="card-title">近期执行记录</h3>
              <span className="card-collapse-arrow">{recordsExpanded ? '▼' : '▶'}</span>
            </button>
            {recordsExpanded && (
              <div className="execution-records">
                {(() => {
                  const records = loadExecutionLog(30);
                  if (records.length === 0) {
                    return <p className="execution-records-empty">暂无记录，完成时间块后选择「按计划执行了」即可记录</p>;
                  }
                  return (
                  <ul className="execution-record-list">
                    {records.map((r, i) => (
                      <li key={`${r.dateKey}-${r.blockId}-${i}`} className="execution-record-item">
                        <span className="execution-record-date">
                          {r.dateKey ? `${Number(r.dateKey.slice(5, 7))}/${Number(r.dateKey.slice(8, 10))}` : ''} {r.weekday != null ? WEEKDAYS[r.weekday] : ''}
                        </span>
                        <span className="execution-record-time">{r.timeRange}</span>
                        <span className="execution-record-title">{r.title}</span>
                        <span className="execution-record-status">{STATUS_LABELS[r.status] || r.status}</span>
                      </li>
                    ))}
                  </ul>
                  );
                })()}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  const weekdayName = WEEKDAYS[now.getDay()];
  const timeRange = formatTimeRange(currentBlock);
  const categoryTag = getCategoryTag(currentBlock.category);

  return (
    <div className="page">
      <header className="header">
        <h1 className="title">同道J人</h1>
        <button className="refresh-button" onClick={handleRefreshNow}>
          刷新
        </button>
      </header>

      <main className="content">
        <section className="card">
          <div className="card-header">
            <span className="badge">{weekdayName}</span>
            <span className="badge badge-category">{categoryTag}</span>
          </div>
          <h2 className="card-title">{currentBlock.title}</h2>
          <p className="card-subtitle">{timeRange}</p>
          <p className="card-text">
            {currentBlock.description.split('\n').map((line, idx) => (
              <span key={idx}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </section>

        <section className="card">
          <h3 className="card-title">今天你想怎么对待这段时间？</h3>
          <div className="status-buttons">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`status-button ${status === opt.key ? 'status-button-active' : ''}`}
                onClick={() => handleStatusChange(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="status-hint">
            这些只是温柔的记录，不是考核。你可以根据真实状态选择“休息”或“改做别的”，不需要自责。
          </p>
        </section>

        <section className="card card-collapsible">
          <button
            type="button"
            className="card-collapse-header"
            onClick={() => setRecordsExpanded((x) => !x)}
          >
            <h3 className="card-title">近期执行记录</h3>
            <span className="card-collapse-arrow">{recordsExpanded ? '▼' : '▶'}</span>
          </button>
          {recordsExpanded && (
            <div className="execution-records">
              {(() => {
                const records = loadExecutionLog(30);
                if (records.length === 0) {
                  return <p className="execution-records-empty">暂无记录，完成时间块后选择「按计划执行了」即可记录</p>;
                }
                return (
                  <ul className="execution-record-list">
                    {records.map((r, i) => {
                      const [y, m, d] = (r.dateKey || '').split('-');
                      const dateStr = m && d ? `${Number(m)}/${Number(d)}` : r.dateKey;
                      const weekday = r.weekday != null ? WEEKDAYS[r.weekday] : '';
                      const statusLabel = STATUS_LABELS[r.status] || r.status;
                      return (
                        <li key={`${r.dateKey}-${r.blockId}-${i}`} className="execution-record-item">
                          <span className="execution-record-date">{dateStr} {weekday}</span>
                          <span className="execution-record-time">{r.timeRange}</span>
                          <span className="execution-record-title">{r.title}</span>
                          <span className="execution-record-status">{statusLabel}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              })()}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function WeekView() {
  const grouped = useMemo(() => getBlocksByWeekday(), []);
  const today = new Date();
  const todayWeekday = today.getDay();
  const currentBlock = getCurrentBlock();
  const currentBlockRef = useRef(null);
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 60000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (currentBlock && currentBlockRef.current) {
      currentBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentBlock?.id]);

  const sections = [];
  for (let wd = 0; wd < 7; wd += 1) {
    const blocks = grouped.get(wd) || [];
    if (blocks.length === 0) continue;
    sections.push({ weekday: wd, blocks });
  }

  return (
    <div className="page">
      <header className="header">
        <h1 className="title">一周节奏</h1>
      </header>
      <main className="content">
        {sections.map((section) => (
          <section
            key={section.weekday}
            className={`weekday-section ${
              section.weekday === todayWeekday ? 'weekday-section-today' : ''
            }`}
          >
            <h2 className="weekday-title">
              {WEEKDAYS[section.weekday]}
              {section.weekday === todayWeekday && <span className="weekday-today-tag">今天</span>}
            </h2>
            <ul className="block-list">
              {section.blocks.map((block) => (
                <li
                  key={block.id}
                  ref={block.id === currentBlock?.id ? currentBlockRef : null}
                  className={`block-item ${block.id === currentBlock?.id ? 'block-item-current' : ''}`}
                >
                  <div className="block-time">{formatTimeRange(block)}</div>
                  <div className="block-main">
                    <div className="block-title-row">
                      <span className="block-title">{block.title}</span>
                      <span className="badge badge-small">{getCategoryTag(block.category)}</span>
                    </div>
                    <p className="block-desc">
                      {block.description.length > 80
                        ? `${block.description.slice(0, 80)}…`
                        : block.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}

function getSchedulePlannerSystem() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekday = now.getDay();
  const weekdayName = WEEKDAYS[weekday];
  const dateFacts = `${year}年${month}月${day}日 ${weekdayName}（weekday=${weekday}）`;

  return `你是用户的「日程策划师」。你了解用户的固定一周节奏（见下方），根据对话帮助用户确认日程调整、给出建议。语气温和、务实，不评判用户，只提供可执行建议。

【事实约束】当前真实日期与星期（由系统提供，请严格以此为准）：${dateFacts}。对「今天」「本周X」「星期几」等事实要素，必须仅基于此信息或向用户确认，不得揣测、编造或自行推断。若无法确定用户所指的具体日期，请主动询问用户。

【日程原则】
1. 不冲突：日程中每个任务应独立占据一个时段，不得出现两个任务时间重叠。提议新增或调整时段时，须先对照用户现有安排，若有重叠则提示冲突并建议其他时段或缩短/移动既有安排。
2. 分类与复盘：根据用户的日程类型（如工作、成长、关系、休息、生活维护等）复盘其各类分布时长，在对话中可简要指出当前结构（如「本周成长类约 X 小时、休息类约 Y 小时」），并基于此给出合理建议。
3. 发现与确认：通过和用户聊天帮助其发现日程安排问题（如某类过多/过少、时段过碎、易冲突等），在给出建议后与用户确认结论，再写入日程。

4. 数据基准：以下日程由系统实时提供，是用户真实日程。判断冲突、回答问题时必须严格以此为准，不得以对话历史中「讨论过但可能未写入」的内容为依据。

${getScheduleSummary()}
${getExecutionHistorySummary() ? `\n${getExecutionHistorySummary()}\n` : ''}

当用户提出调整（如某时段改做别的、某天想休息、或新增某时段）时，先确认理解，再结合上述原则给出简洁建议或替代安排；若有时间冲突或分布不合理，主动指出并协商。用户询问「我的价值取向」「成长建议」「执行复盘」时，可结合过去执行记录分析各类型（成长、关系、休息等）占比与变化趋势，给出温和、务实的建议。

【何时输出 [RYTHOM_READY]】当你在本条回复中已提出「一条具体、可执行的日程调整」或「要记录的过去任务」，且等待用户决定是否写入时，在回复末尾换行写 [RYTHOM_READY]。以下情况不输出：仅做分类复盘、占比分析；仍问开放问题。这样用户端会看到「加入计划」按钮。

【禁止提前声称已写入】在用户尚未通过前端的确认按钮完成写入前，不得说「已为您调整」「已写入您的日程」「已调整为」等。只能说「可以帮您写入」「要现在写入吗」「若确认我可帮您写入」等，避免用户误以为已生效。

【必须遵守】当用户明确同意写入日程（例如说「好的」「确认」「可以」「写进去吧」）且你已描述过具体调整内容时，你必须在同一条回复的末尾输出下面的结构化块，否则前端无法执行写入、用户会认为功能失效。注意：仅用自然语言回复「好的，已调整为…」而不输出下面的块，会导致用户点击确认后日程仍无变化，务必同时输出 [RYTHOM_UPDATE] 块。
- 先写你的自然语言回复（例如「好的，我将为您调整…」）。
- 然后换行，严格按下面格式输出，不要漏掉任何符号：
[RYTHOM_UPDATE]
{"summary":"一句话描述","changes":[...],"removals":[...],"pastRecords":[...]}
[/RYTHOM_UPDATE]
规则：weekday 0=周日、1=周一…6=周六；start/end 用 "HH:mm"。summary 为简短中文。
- changes：新增或替换的时段，每项必含 weekday、start、end、title、description。
- removals：需要删除或让位的时段，每项含 weekday、start。当用户要求「推迟」「改时间」「取消」「删掉」某已有块时，必须把原有时段加入 removals，否则会保留原块导致冲突。例如：用户说「周一成长夜深度成长推迟到 21:00」，应输出 removals:[{"weekday":1,"start":"20:00"}] 和 changes:[{"weekday":1,"start":"21:00","end":"22:30","title":"成长夜·深度成长",...}]，这样原 20:00 块会被移除、21:00 新块被添加，避免重复。

【记录过去任务】当用户说「帮我记录过去的任务」「记一下昨天/上周我做了XX」等，你需将用户描述的过去执行内容输出到 pastRecords 中，格式：pastRecords:[{"dateKey":"YYYY-MM-DD","start":"HH:mm","end":"HH:mm","title":"任务名","category":"deep_growth"等,"status":"done"}]。dateKey 为任务日期；start/end 为时段；category 可选值：morning_commute,evening_commute,deep_growth,relationship,relax,life_maintenance,work,weekend_growth,weekend_planning,free；status 默认 "done"。可仅输出 pastRecords 不输出 changes/removals。用户确认后前端会写入近期执行记录。`;
}

function ChatView() {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [messages, setMessages] = useState(() => loadChatMessages());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(/** @type {{ messageIndex: number; payload: { summary: string; changes: Array<{ weekday: number; start: string; end?: string; title: string; description?: string }> } } | null */ null);
  const listRef = useRef(null);

  const hasKey = zhipu.hasApiKey();

  const applyScheduleUpdate = (payload) => {
    const norm = (s) => {
      const [h, m] = String(s ?? '').split(':');
      return `${String(Number(h) || 0).padStart(2, '0')}:${String(Number(m) || 0).padStart(2, '0')}`;
    };
    const pad = (n) => String(Number(n) ?? 0).padStart(2, '0');
    const changes = payload.changes || [];
    const removals = payload.removals || [];
    const pastRecords = payload.pastRecords || [];
    let next = loadOverrides();

    // 1. 处理 removals
    removals.forEach((r) => {
      const nStart = norm(r.start);
      next = next.filter((o) => !(o.weekday === r.weekday && norm(o.start) === nStart));
      const tmpl = findTemplateBlock(r.weekday, r.start);
      if (tmpl) {
        next.push({
          weekday: r.weekday,
          start: nStart,
          end: `${pad(tmpl.end.hour)}:${pad(tmpl.end.minute)}`,
          title: REMOVED_OVERRIDE_TITLE,
          description: '',
        });
      }
    });

    // 2. 处理 changes
    next = next.filter((o) => !changes.some((c) => o.weekday === c.weekday && norm(o.start) === norm(c.start)));
    changes.forEach((c) => next.push({ weekday: c.weekday, start: norm(c.start), end: norm(c.end ?? c.start), title: c.title, description: c.description ?? '' }));
    saveOverrides(next);

    // 3. 处理 pastRecords：写入近期执行记录
    pastRecords.forEach((r, i) => {
      const nStart = norm(r.start);
      const nEnd = norm(r.end ?? r.start);
      const dateKey = String(r.dateKey || '').slice(0, 10);
      const weekday = dateKey ? new Date(dateKey + 'T12:00:00').getDay() : 0;
      saveExecutionRecord({
        dateKey,
        blockId: `custom-${dateKey}-${nStart}-${(r.title || '').slice(0, 20)}-${i}`,
        title: r.title || '自定义',
        category: r.category || 'free',
        status: r.status || 'done',
        weekday,
        timeRange: `${nStart}–${nEnd}`,
      });
    });

    setPendingConfirm(null);
    const hasSchedule = changes.length > 0 || removals.length > 0;
    const hasPast = pastRecords.length > 0;
    let doneText = '已完成。';
    if (hasSchedule) doneText += '已写入你的日程，可在「现在」和「一周节奏」查看。';
    if (hasPast) doneText += '已写入近期执行记录。';
    if (hasSchedule || hasPast) doneText += '下次沟通将基于此次固化的内容。';
    const doneMsg = { role: 'assistant', content: doneText };
    const nextMsg = [doneMsg];
    saveChatMessages(nextMsg);
    setMessages(nextMsg);
  };

  useEffect(() => {
    saveChatMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSaveKey = () => {
    zhipu.setApiKey(apiKeyInput.trim());
    setApiKeyInput('');
    setShowKeyForm(false);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!hasKey) {
      setShowKeyForm(true);
      return;
    }
    setInput('');
    setError(null);
    setPendingConfirm(null);
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setLoading(true);
    const newAssistantIndex = messages.length + 1;
    try {
      const systemMsg = { role: 'system', content: getSchedulePlannerSystem() };
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const apiMessages = [systemMsg, ...history];
      const reply = await zhipu.chatStream(apiMessages, (chunk) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === 'assistant') next[next.length - 1] = { ...last, content: last.content + chunk };
          return next;
        });
      });
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === 'assistant') next[next.length - 1] = { ...last, content: reply };
        saveChatMessages(next);
        return next;
      });
      const { updatePayload } = parseScheduleUpdate(reply);
      if (updatePayload) {
        setPendingConfirm({ messageIndex: newAssistantIndex, payload: updatePayload });
      } else if (isConfirmationLike(text) && hasPriorProposalWithReady(messages, messages.length)) {
        // 用户已确认但助手未输出结构化块，自动补一次请求获取 [RYTHOM_UPDATE]
        try {
          const historyWithNewReply = [...messages, userMsg, { role: 'assistant', content: reply }];
          const historyForApi = historyWithNewReply.map((m) => ({ role: m.role, content: m.content }));
          const followUpReply = await zhipu.chat([systemMsg, ...historyForApi, { role: 'user', content: REQUEST_UPDATE_PROMPT }]);
          const { updatePayload: followUpPayload } = parseScheduleUpdate(followUpReply);
          if (followUpPayload) setPendingConfirm({ messageIndex: newAssistantIndex, payload: followUpPayload });
          else setError('未能解析到日程变更，请点击「将上一条建议加入计划」重试');
        } catch (e2) {
          setError(e2.message || '获取日程格式失败，请重试');
        }
      }
    } catch (e) {
      setError(e.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const REQUEST_UPDATE_PROMPT = '请根据本轮对话中你描述的日程调整或过去任务记录，仅输出一个 [RYTHOM_UPDATE] 块，不要输出任何其他文字。格式：换行后 [RYTHOM_UPDATE]，换行后一行 JSON（含 summary、changes、removals、pastRecords）。changes 每项含 weekday、start、end、title、description；removals 每项含 weekday、start；若涉及推迟/改时/取消，务必在 removals 中列出原时段。pastRecords 为过去执行记录，每项含 dateKey(YYYY-MM-DD)、start、end、title、category(可选)、status(可选，默认done)。可仅输出 pastRecords 不输出 changes/removals。换行后 [/RYTHOM_UPDATE]。';

  /** 用户消息是否为确认/同意类（如「好的」「确认」「可以」） */
  const isConfirmationLike = (text) => {
    const t = (text || '').trim().toLowerCase();
    return /^(好的|好|确认|可以|行|写进去|写进去吧|写吧|加入|加入计划|ok|yes|y)$/.test(t) || /^好[的]*\s*$/i.test(t);
  };

  /** 检查历史中是否有助手曾提出过可写入的具体建议（含 [RYTHOM_READY]） */
  const hasPriorProposalWithReady = (msgs, beforeIndex) => {
    for (let i = Math.min(beforeIndex, msgs.length - 1); i >= 0; i--) {
      if (msgs[i].role === 'assistant' && parseScheduleUpdate(msgs[i].content).hasReady) return true;
    }
    return false;
  };

  const getLastAssistantIndex = () => {
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === 'assistant') return i;
    return -1;
  };

  const requestScheduleUpdateFromLast = async () => {
    if (loading || !hasKey) return;
    const lastAssistantIndex = getLastAssistantIndex();
    if (lastAssistantIndex < 0) return;
    const lastAssistant = messages[lastAssistantIndex];
    if (parseScheduleUpdate(lastAssistant.content).updatePayload) return;
    setError(null);
    setPendingConfirm(null);
    const displayUserMsg = { role: 'user', content: '将上一条建议加入计划' };
    setMessages((prev) => [...prev, displayUserMsg, { role: 'assistant', content: '' }]);
    setLoading(true);
    const newAssistantIndex = messages.length + 1;
    try {
      const systemMsg = { role: 'system', content: getSchedulePlannerSystem() };
      const historyUpToAssistant = messages.slice(0, lastAssistantIndex + 1).map((m) => ({ role: m.role, content: m.content }));
      const historyForApi = [...historyUpToAssistant, { role: 'user', content: REQUEST_UPDATE_PROMPT }];
      const apiMessages = [systemMsg, ...historyForApi];
      const reply = await zhipu.chatStream(apiMessages, (chunk) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === 'assistant') next[next.length - 1] = { ...last, content: last.content + chunk };
          return next;
        });
      });
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === 'assistant') next[next.length - 1] = { ...last, content: reply };
        saveChatMessages(next);
        return next;
      });
      const { updatePayload } = parseScheduleUpdate(reply);
      if (updatePayload) setPendingConfirm({ messageIndex: newAssistantIndex, payload: updatePayload });
      else setError('未能解析到日程变更，请重试或重新描述调整');
    } catch (e) {
      setError(e.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  if (!hasKey && !showKeyForm) {
    return (
      <div className="page">
        <header className="header">
          <h1 className="title">日程策划师</h1>
        </header>
        <main className="content">
          <section className="card">
            <h2 className="card-title">使用智谱 AI 对话</h2>
            <p className="card-text">
              请先填写你在智谱 AI 开放平台获取的 API Key，用于与「日程策划师」对话。Key 仅保存在本机浏览器中，不会上传。
            </p>
            <div className="chat-key-form">
              <input
                type="password"
                className="chat-key-input"
                placeholder="粘贴智谱 API Key"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                autoComplete="off"
              />
              <button type="button" className="status-button" onClick={handleSaveKey} disabled={!apiKeyInput.trim()}>
                保存并开始
              </button>
            </div>
            <p className="status-hint">
              未注册可前往 open.bigmodel.cn 申请；保存后可在对话页通过「设置」更换 Key。
            </p>
          </section>
        </main>
      </div>
    );
  }

  if (showKeyForm && hasKey) {
    return (
      <div className="page">
        <header className="header">
          <h1 className="title">设置 API Key</h1>
          <button className="refresh-button" onClick={() => setShowKeyForm(false)}>返回</button>
        </header>
        <main className="content">
          <section className="card">
            <p className="card-text">重新设置智谱 AI API Key（仅存于本机）：</p>
            <input
              type="password"
              className="chat-key-input"
              placeholder="新的 API Key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              autoComplete="off"
            />
            <button type="button" className="status-button" style={{ marginTop: 8 }} onClick={handleSaveKey} disabled={!apiKeyInput.trim()}>
              保存
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="page page-chat">
      <header className="header">
        <h1 className="title">日程策划师</h1>
        <button className="refresh-button" onClick={() => setShowKeyForm(true)}>设置</button>
      </header>
      <div className="chat-list" ref={listRef}>
        {messages.length === 0 && (
          <div className="chat-placeholder">
            <p>和策划师聊聊日程调整或本周安排，我会根据你的固定节奏给建议。</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isAssistant = msg.role === 'assistant';
          const parsed = isAssistant ? parseScheduleUpdate(msg.content) : { displayContent: msg.content, updatePayload: null, hasReady: false };
          const { displayContent, updatePayload, hasReady } = parsed;
          const showConfirm = isAssistant && pendingConfirm?.messageIndex === i && pendingConfirm.payload;
          const isLastAssistant = isAssistant && i === messages.length - 1;
          const showFallbackBtn = isLastAssistant && !updatePayload && !loading && hasReady;
          const bubbleText = isAssistant && displayContent.trim() === '' && updatePayload
            ? '已生成日程调整，请在下方确认。'
            : isAssistant && displayContent.trim() === '' && loading
              ? '正在思考…'
              : displayContent;
          return (
            <div key={i}>
              <div className={`chat-bubble chat-bubble-${msg.role}`}>
                <div className="chat-bubble-content">{bubbleText}</div>
              </div>
              {showConfirm && (
                <div className="chat-confirm-card">
                  {(() => {
                    const { changes = [], removals = [], pastRecords = [] } = pendingConfirm.payload;
                    const hasSchedule = changes.length > 0 || removals.length > 0;
                    const hasPast = pastRecords.length > 0;
                    return (
                      <>
                        <p className="chat-confirm-title">
                          {hasPast && !hasSchedule ? '是否将以下过去任务写入近期执行记录？' : '是否将以下调整写入你的日程？'}
                        </p>
                        <p className="chat-confirm-summary">{pendingConfirm.payload.summary}</p>
                        {removals.length > 0 && (
                          <p className="chat-confirm-removals">
                            将移除：{removals.map((r) => `${WEEKDAYS[r.weekday]} ${r.start}`).join('、')}
                          </p>
                        )}
                        {pastRecords.length > 0 && (
                          <p className="chat-confirm-past-records">
                            将记录：{pastRecords.map((r) => `${r.dateKey} ${r.start}–${r.end || r.start} ${r.title}`).join('；')}
                          </p>
                        )}
                        <div className="chat-confirm-actions">
                          <button type="button" className="chat-confirm-btn chat-confirm-cancel" onClick={() => setPendingConfirm(null)}>取消</button>
                          <button type="button" className="chat-confirm-btn chat-confirm-ok" onClick={() => applyScheduleUpdate(pendingConfirm.payload)}>确认</button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
              {showFallbackBtn && (
                <div className="chat-fallback-row">
                  <button type="button" className="chat-fallback-btn" onClick={requestScheduleUpdateFromLast}>
                    加入计划
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="chat-bubble chat-bubble-assistant">
            <div className="chat-bubble-content">正在思考…</div>
          </div>
        )}
      </div>
      {error && <div className="chat-error">{error}</div>}
      {(() => {
        const lastAssistantIdx = getLastAssistantIndex();
        const lastParsed = lastAssistantIdx >= 0 ? parseScheduleUpdate(messages[lastAssistantIdx].content) : { updatePayload: null, hasReady: false };
        const lastUserMsg = messages.length >= 2 && messages[messages.length - 2].role === 'user' ? messages[messages.length - 2] : null;
        const hadConfirmationWithoutBlock = lastUserMsg && isConfirmationLike(lastUserMsg.content) && hasPriorProposalWithReady(messages, messages.length);
        const showStickyAddPlan = lastAssistantIdx >= 0 && !lastParsed.updatePayload && !loading && messages.length > 0 &&
          (lastParsed.hasReady || hadConfirmationWithoutBlock);
        return showStickyAddPlan ? (
          <div className="chat-sticky-add-plan">
            <button type="button" className="chat-fallback-btn chat-sticky-add-plan-btn" onClick={requestScheduleUpdateFromLast}>
              将上一条建议加入计划
            </button>
          </div>
        ) : null;
      })()}
      <div className="chat-input-row">
        <textarea
          className="chat-input"
          placeholder="输入后发送…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          rows={2}
          disabled={loading}
        />
        <button className="chat-send" onClick={handleSend} disabled={loading || !input.trim()}>
          发送
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('now');

  return (
    <div className="app-root">
      {tab === 'now' && <CurrentBlockView />}
      {tab === 'week' && <WeekView />}
      {tab === 'chat' && <ChatView />}
      <nav className="tab-bar">
        <button
          className={`tab-button ${tab === 'now' ? 'tab-button-active' : ''}`}
          onClick={() => setTab('now')}
        >
          现在
        </button>
        <button
          className={`tab-button ${tab === 'week' ? 'tab-button-active' : ''}`}
          onClick={() => setTab('week')}
        >
          一周节奏
        </button>
        <button
          className={`tab-button ${tab === 'chat' ? 'tab-button-active' : ''}`}
          onClick={() => setTab('chat')}
        >
          对话
        </button>
      </nav>
    </div>
  );
}

