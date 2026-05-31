// ===== 초기 데이터 =====
const INITIAL_DATA = {
  pre: [
    { id: 'pre-1', text: '비짓재팬 등록', status: 'todo' },
    { id: 'pre-2', text: '오토체크인', status: 'todo' },
    { id: 'pre-3', text: '좌석 변경 (6월 1일 오전 9시 10분)', status: 'todo' },
  ],
  places: [
    { id: 'p1', text: '지브리파크', status: 'todo' },
  ],
  food: [
    { id: 'f1', text: '히츠마무시', status: 'todo' },
    { id: 'f2', text: '테바사키', status: 'todo' },
    { id: 'f3', text: '하브스', status: 'todo' },
  ],
  shopping: [
    { id: 's1', text: '스투시', status: 'todo' },
    { id: 's2', text: '슈프림', status: 'todo' },
    { id: 's3', text: '빔즈', status: 'todo' },
    { id: 's4', text: '엘엘빈', status: 'todo' },
    { id: 's5', text: '포터', status: 'todo' },
  ],
  donki: [
    { id: 'd1', text: '용각산 캔디', status: 'todo' },
    { id: 'd2', text: '비올 때 먹는 두통약', status: 'todo' },
    { id: 'd3', text: '이브 생리통 진통제', status: 'todo' },
    { id: 'd4', text: '휴족시간', status: 'todo' },
    { id: 'd5', text: '마스크', status: 'todo' },
  ],
  packing: {
    hazel: [
      { id: 'ph1',  text: '보조배터리', priority: 'red',    done: false },
      { id: 'ph2',  text: '셀카봉',    priority: 'yellow', done: false },
      { id: 'ph3',  text: '속옷',      priority: 'red',    done: false },
      { id: 'ph4',  text: '잠옷',      priority: 'yellow', done: false },
      { id: 'ph5',  text: '바람막이',  priority: 'yellow', done: false },
      { id: 'ph6',  text: '양우산',    priority: 'yellow', done: false },
      { id: 'ph7',  text: '작은가방',  priority: 'yellow', done: false },
      { id: 'ph8',  text: '편한신발',  priority: 'red',    done: false },
      { id: 'ph9',  text: '슬리퍼',    priority: 'yellow', done: false },
      { id: 'ph10', text: '모자',      priority: 'yellow', done: false },
      { id: 'ph11', text: '썬글라스',  priority: 'gray',   done: false },
      { id: 'ph12', text: '마스크',    priority: 'gray',   done: false },
    ],
    kyle: [
      { id: 'pk1', text: '보조배터리', priority: 'red',    done: false },
      { id: 'pk2', text: '속옷',       priority: 'red',    done: false },
      { id: 'pk3', text: '잠옷',       priority: 'yellow', done: false },
      { id: 'pk4', text: '바람막이',   priority: 'yellow', done: false },
      { id: 'pk5', text: '편한신발',   priority: 'red',    done: false },
      { id: 'pk6', text: '슬리퍼',     priority: 'yellow', done: false },
      { id: 'pk7', text: '모자',       priority: 'yellow', done: false },
    ],
  },
};

// ===== 상수 =====
const STATUS_CYCLE = ['todo', 'planned', 'done'];
const STATUS_LABEL = { todo: '예정', planned: '완료 예정', done: '완료 ✓' };
const STATUS_ICON  = { todo: '⬜', planned: '🔶', done: '✅' };
const PRIORITY_CYCLE = ['red', 'yellow', 'gray'];
const PRIORITY_TITLE = {
  red:    '개 중요 → 필수로 변경',
  yellow: '필수 → 있어도 없어도로 변경',
  gray:   '있어도 없어도 → 개 중요로 변경',
};
const TODO_KEYS    = ['pre', 'places', 'food', 'shopping', 'donki'];
const PACKING_KEYS = ['hazel', 'kyle'];

// ===== 상태 =====
let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem('ngo-travel-2026');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return JSON.parse(JSON.stringify(INITIAL_DATA));
}

function saveState() {
  localStorage.setItem('ngo-travel-2026', JSON.stringify(state));
}

// ===== 유틸 =====
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nextInCycle(cycle, current) {
  return cycle[(cycle.indexOf(current) + 1) % cycle.length];
}

// ===== TODO 리스트 =====
function renderTodoList(key) {
  const ul = document.getElementById(`${key}-list`);
  ul.innerHTML = '';
  state[key].forEach(item => {
    const li = document.createElement('li');
    li.className = `todo-item ${item.status}`;
    li.dataset.id = item.id;
    li.innerHTML = `
      <button class="status-btn" title="상태 변경" data-key="${key}" data-id="${item.id}">${STATUS_ICON[item.status]}</button>
      <span class="item-text">${escapeHtml(item.text)}</span>
      <span class="status-label">${STATUS_LABEL[item.status]}</span>
      <button class="delete-btn" title="삭제" data-key="${key}" data-id="${item.id}">✕</button>
    `;
    ul.appendChild(li);
  });
}

function handleTodoClick(e) {
  const statusBtn = e.target.closest('.status-btn');
  const deleteBtn = e.target.closest('.delete-btn');

  if (statusBtn) {
    const { key, id } = statusBtn.dataset;
    const item = state[key].find(i => i.id === id);
    if (item) {
      item.status = nextInCycle(STATUS_CYCLE, item.status);
      saveState();
      renderTodoList(key);
    }
  } else if (deleteBtn) {
    const { key, id } = deleteBtn.dataset;
    state[key] = state[key].filter(i => i.id !== id);
    saveState();
    renderTodoList(key);
  }
}

function addItem(key) {
  const input = document.getElementById(`${key}-input`);
  const text = input.value.trim();
  if (!text) return;
  state[key].push({ id: `${key}-${Date.now()}`, text, status: 'todo' });
  input.value = '';
  saveState();
  renderTodoList(key);
}

// ===== 챙길 것 =====
function renderPackingList(person) {
  const ul = document.getElementById(`packing-${person}`);
  ul.innerHTML = '';
  state.packing[person].forEach(item => {
    const li = document.createElement('li');
    li.className = `packing-item${item.done ? ' done' : ''}`;
    li.dataset.id = item.id;
    li.draggable = true;
    li.innerHTML = `
      <span class="drag-handle" title="드래그해서 순서 변경">&#9776;</span>
      <span class="priority-dot ${item.priority} clickable" title="${PRIORITY_TITLE[item.priority]}" data-person="${person}" data-id="${item.id}"></span>
      <input type="checkbox" ${item.done ? 'checked' : ''} data-person="${person}" data-id="${item.id}" />
      <span class="item-text">${escapeHtml(item.text)}</span>
      <button class="delete-btn" title="삭제" data-person="${person}" data-id="${item.id}">✕</button>
    `;
    ul.appendChild(li);
  });
  initPackingDrag(person);
}

// 단일 아이템 DOM 업데이트 (전체 재렌더 없이)
function updatePackingItemDOM(person, id) {
  const item = state.packing[person].find(i => i.id === id);
  if (!item) return;
  const li = document.querySelector(`#packing-${person} [data-id="${id}"]`)?.closest('.packing-item');
  if (!li) return;

  li.className = `packing-item${item.done ? ' done' : ''}`;
  const dot = li.querySelector('.priority-dot');
  dot.className = `priority-dot ${item.priority} clickable`;
  dot.title = PRIORITY_TITLE[item.priority];
  const cb = li.querySelector('input[type="checkbox"]');
  cb.checked = item.done;
}

function handlePackingClick(e) {
  const dot = e.target.closest('.priority-dot.clickable');
  const deleteBtn = e.target.closest('.delete-btn[data-person]');

  if (dot) {
    const { person, id } = dot.dataset;
    const item = state.packing[person].find(i => i.id === id);
    if (item) {
      item.priority = nextInCycle(PRIORITY_CYCLE, item.priority);
      saveState();
      updatePackingItemDOM(person, id);
    }
  } else if (deleteBtn) {
    const { person, id } = deleteBtn.dataset;
    state.packing[person] = state.packing[person].filter(i => i.id !== id);
    saveState();
    renderPackingList(person);
  }
}

function handlePackingChange(e) {
  const cb = e.target.closest('input[type="checkbox"][data-person]');
  if (!cb) return;
  const { person, id } = cb.dataset;
  const item = state.packing[person].find(i => i.id === id);
  if (item) {
    item.done = cb.checked;
    saveState();
    updatePackingItemDOM(person, id);
  }
}

function addPackingItem(person) {
  const input    = document.getElementById(`packing-${person}-input`);
  const priority = document.getElementById(`packing-${person}-priority`).value;
  const text     = input.value.trim();
  if (!text) return;
  state.packing[person].push({ id: `pk-${Date.now()}`, text, priority, done: false });
  input.value = '';
  saveState();
  renderPackingList(person);
}

// ===== 드래그 앤 드롭 =====
function initPackingDrag(person) {
  const ul = document.getElementById(`packing-${person}`);
  let dragSrc = null;

  ul.querySelectorAll('.packing-item').forEach(item => {
    item.querySelector('.drag-handle').addEventListener('mousedown', () => {
      item.draggable = true;
    });

    item.addEventListener('dragstart', e => {
      dragSrc = item;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => item.classList.add('dragging'), 0);
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      ul.querySelectorAll('.packing-item').forEach(i => i.classList.remove('drag-over'));
      const newOrder = [...ul.querySelectorAll('.packing-item')].map(el => el.dataset.id);
      state.packing[person].sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
      saveState();
    });

    item.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (item !== dragSrc) {
        ul.querySelectorAll('.packing-item').forEach(i => i.classList.remove('drag-over'));
        item.classList.add('drag-over');
      }
    });

    item.addEventListener('drop', e => {
      e.preventDefault();
      if (dragSrc && dragSrc !== item) {
        const items = [...ul.querySelectorAll('.packing-item')];
        ul.insertBefore(dragSrc, items.indexOf(dragSrc) < items.indexOf(item) ? item.nextSibling : item);
      }
      item.classList.remove('drag-over');
    });
  });
}

// ===== D-DAY =====
function initDday() {
  const DEPART = new Date('2026-06-03T09:10:00');
  const RETURN = new Date('2026-06-07T23:59:59');
  const el = document.getElementById('hero-dday');

  function update() {
    const now = new Date();
    const diffMs = DEPART - now;

    if (now >= DEPART && now <= RETURN) {
      const dayNum = Math.floor((now - DEPART) / 86400000) + 1;
      el.innerHTML = `<span class="dday-badge traveling">✈️ 여행 ${dayNum}일차 · 나고야에 있는 중!</span>`;
    } else if (diffMs > 0) {
      // D-day는 날짜 기준, 시간은 실제 출발 시각까지 남은 시간
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const departDay = new Date('2026-06-03T00:00:00');
      const days  = Math.round((departDay - today) / 86400000);
      const hours = Math.floor((diffMs % 86400000) / 3600000);
      const mins  = Math.floor((diffMs % 3600000)  / 60000);
      const secs  = Math.floor((diffMs % 60000)    / 1000);

      if (days > 0) {
        el.innerHTML = `<span class="dday-badge">D-${days}</span><span class="dday-sub">${hours}시간 ${mins}분 후 출발</span>`;
      } else {
        el.innerHTML = `<span class="dday-badge dday-soon">D-DAY</span><span class="dday-sub">${hours}시간 ${mins}분 ${secs}초 후 출발 🔥</span>`;
        setTimeout(update, 1000);
        return;
      }
    } else {
      el.innerHTML = `<span class="dday-badge ended">여행 완료 🎉</span>`;
    }
  }

  update();
  setInterval(update, 60000); // 1분마다 갱신 (D-day 당일엔 1초)
}

// ===== 메모 =====
function loadMemos() {
  try { return JSON.parse(localStorage.getItem('ngo-memos') || '[]'); } catch { return []; }
}
function saveMemos(memos) {
  localStorage.setItem('ngo-memos', JSON.stringify(memos));
}

function renderMemos() {
  const memos = loadMemos();
  const container = document.getElementById('memo-list');
  container.innerHTML = '';

  if (memos.length === 0) return;

  memos.forEach((memo, idx) => {
    const div = document.createElement('div');
    div.className = 'memo-item';
    div.dataset.idx = idx;
    div.innerHTML = `
      <div class="memo-header">
        <span class="memo-title">${escapeHtml(memo.title)}</span>
        <button class="delete-btn memo-delete" data-idx="${idx}" title="삭제">✕</button>
      </div>
      <textarea class="memo-body" placeholder="내용을 입력하세요..." data-idx="${idx}">${escapeHtml(memo.body)}</textarea>
    `;
    container.appendChild(div);
  });
}

function addMemo() {
  const titleInput = document.getElementById('memo-title-input');
  const title = titleInput.value.trim();
  if (!title) return;
  const memos = loadMemos();
  memos.push({ title, body: '' });
  saveMemos(memos);
  titleInput.value = '';
  renderMemos();
  // 새로 추가된 textarea에 포커스
  const textareas = document.querySelectorAll('.memo-body');
  if (textareas.length) textareas[textareas.length - 1].focus();
}

function handleMemoEvents(e) {
  const deleteBtn = e.target.closest('.memo-delete');
  if (deleteBtn) {
    const idx = parseInt(deleteBtn.dataset.idx);
    const memos = loadMemos();
    memos.splice(idx, 1);
    saveMemos(memos);
    renderMemos();
  }
}

function handleMemoInput(e) {
  const textarea = e.target.closest('.memo-body');
  if (!textarea) return;
  const idx = parseInt(textarea.dataset.idx);
  const memos = loadMemos();
  if (memos[idx]) {
    memos[idx].body = textarea.value;
    saveMemos(memos);
  }
}


function switchTab(person, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`tab-${person}`).classList.add('active');
}

// ===== 항공권 아코디언 =====
function toggleFlight() {
  document.getElementById('flight-body').classList.toggle('open');
  document.getElementById('flight-toggle-icon').classList.toggle('open');
}

// ===== 이벤트 위임 등록 =====
function initEvents() {
  // 투두 클릭 (상태변경 / 삭제)
  TODO_KEYS.forEach(key => {
    document.getElementById(`${key}-list`).addEventListener('click', handleTodoClick);
  });

  // 투두 Enter 키
  TODO_KEYS.forEach(key => {
    document.getElementById(`${key}-input`).addEventListener('keydown', e => {
      if (e.key === 'Enter') addItem(key);
    });
  });

  // 투두 추가 버튼
  TODO_KEYS.forEach(key => {
    document.getElementById(`${key}-add-btn`).addEventListener('click', () => addItem(key));
  });

  // 챙길 것 클릭 / 체크박스 / Enter / 추가 버튼
  PACKING_KEYS.forEach(person => {
    document.getElementById(`packing-${person}`).addEventListener('click', handlePackingClick);
    document.getElementById(`packing-${person}`).addEventListener('change', handlePackingChange);
    document.getElementById(`packing-${person}-input`).addEventListener('keydown', e => {
      if (e.key === 'Enter') addPackingItem(person);
    });
    document.getElementById(`packing-${person}-add-btn`).addEventListener('click', () => addPackingItem(person));
  });

  // 메모
  document.getElementById('memo-add-btn').addEventListener('click', addMemo);
  document.getElementById('memo-title-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addMemo();
  });
  document.getElementById('memo-list').addEventListener('click', handleMemoEvents);
  document.getElementById('memo-list').addEventListener('input', handleMemoInput);
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
  TODO_KEYS.forEach(renderTodoList);
  PACKING_KEYS.forEach(renderPackingList);
  renderMemos();
  initDday();
  initEvents();
});
