// ===== Firebase 초기화 =====
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase, ref, onValue, set, update, remove, get }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyAOm4r1v1DHg4y1blqjAAVDHTtaQJ8C4Ow",
  authDomain: "ngo-db-549a0.firebaseapp.com",
  databaseURL: "https://ngo-db-549a0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ngo-db-549a0",
  storageBucket: "ngo-db-549a0.firebasestorage.app",
  messagingSenderId: "508315286270",
  appId: "1:508315286270:web:06d6e7f2bc84f5fa1bc3af"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ===== 초기 데이터 =====
const INITIAL_DATA = {
  pre: [
    { id: 'pre-1', text: '비짓재팬 등록', status: 'todo' },
    { id: 'pre-2', text: '오토체크인', status: 'todo' },
    { id: 'pre-3', text: '좌석 변경 (6월 1일 오전 9시 10분)', status: 'todo' },
  ],
  places:   [{ id: 'p1', text: '지브리파크', status: 'todo' }],
  food:     [
    { id: 'f1', text: '히츠마무시', status: 'todo' },
    { id: 'f2', text: '테바사키',   status: 'todo' },
    { id: 'f3', text: '하브스',     status: 'todo' },
  ],
  shopping: [
    { id: 's1', text: '스투시', status: 'todo' },
    { id: 's2', text: '슈프림', status: 'todo' },
    { id: 's3', text: '빔즈',   status: 'todo' },
    { id: 's4', text: '엘엘빈', status: 'todo' },
    { id: 's5', text: '포터',   status: 'todo' },
  ],
  donki: [
    { id: 'd1', text: '용각산 캔디',        status: 'todo' },
    { id: 'd2', text: '비올 때 먹는 두통약', status: 'todo' },
    { id: 'd3', text: '이브 생리통 진통제',  status: 'todo' },
    { id: 'd4', text: '휴족시간',           status: 'todo' },
    { id: 'd5', text: '마스크',             status: 'todo' },
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
  memos: [],
};

// ===== 상수 =====
const STATUS_CYCLE  = ['todo', 'planned', 'done'];
const STATUS_LABEL  = { todo: '예정', planned: '완료 예정', done: '완료 ✓' };
const STATUS_ICON   = { todo: '⬜', planned: '🔶', done: '✅' };
const PRIORITY_CYCLE = ['red', 'yellow', 'gray'];
const PRIORITY_TITLE = {
  red:    '개 중요 → 필수로 변경',
  yellow: '필수 → 있어도 없어도로 변경',
  gray:   '있어도 없어도 → 개 중요로 변경',
};
const TODO_KEYS    = ['pre', 'places', 'food', 'shopping', 'donki'];
const PACKING_KEYS = ['hazel', 'kyle'];

// ===== 로컬 상태 (Firebase에서 받아온 데이터 캐시) =====
let state = JSON.parse(JSON.stringify(INITIAL_DATA));

// ===== 유틸 =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function nextInCycle(cycle, current) {
  return cycle[(cycle.indexOf(current) + 1) % cycle.length];
}

// Firebase 배열 저장 헬퍼 (null 방지)
function toFirebaseList(arr) {
  const obj = {};
  arr.forEach((item, i) => { obj[i] = item; });
  return obj;
}
function fromFirebaseList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return Object.values(val);
}

// ===== Firebase 저장 =====
function saveKey(key) {
  set(ref(db, `state/${key}`), toFirebaseList(state[key]));
}
function savePackingPerson(person) {
  set(ref(db, `state/packing/${person}`), toFirebaseList(state.packing[person]));
}
function saveMemos() {
  set(ref(db, `state/memos`), toFirebaseList(state.memos));
}

// ===== Firebase 실시간 구독 =====
function subscribeAll() {
  // 투두 리스트들
  TODO_KEYS.forEach(key => {
    onValue(ref(db, `state/${key}`), snap => {
      state[key] = fromFirebaseList(snap.val());
      renderTodoList(key);
    });
  });

  // 챙길 것
  PACKING_KEYS.forEach(person => {
    onValue(ref(db, `state/packing/${person}`), snap => {
      state.packing[person] = fromFirebaseList(snap.val());
      renderPackingList(person);
    });
  });

  // 메모
  onValue(ref(db, `state/memos`), snap => {
    state.memos = fromFirebaseList(snap.val());
    renderMemos();
  });
}

// ===== 초기 데이터 세팅 (첫 실행 시만) =====
async function initFirebaseData() {
  const snap = await get(ref(db, 'state'));
  if (!snap.exists()) {
    await set(ref(db, 'state'), {
      pre:      toFirebaseList(INITIAL_DATA.pre),
      places:   toFirebaseList(INITIAL_DATA.places),
      food:     toFirebaseList(INITIAL_DATA.food),
      shopping: toFirebaseList(INITIAL_DATA.shopping),
      donki:    toFirebaseList(INITIAL_DATA.donki),
      packing: {
        hazel: toFirebaseList(INITIAL_DATA.packing.hazel),
        kyle:  toFirebaseList(INITIAL_DATA.packing.kyle),
      },
      memos: toFirebaseList([]),
    });
  }
}

// ===== TODO 렌더 =====
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
    if (item) { item.status = nextInCycle(STATUS_CYCLE, item.status); saveKey(key); }
  } else if (deleteBtn) {
    const { key, id } = deleteBtn.dataset;
    state[key] = state[key].filter(i => i.id !== id);
    saveKey(key);
  }
}

function addItem(key) {
  const input = document.getElementById(`${key}-input`);
  const text = input.value.trim();
  if (!text) return;
  state[key].push({ id: `${key}-${Date.now()}`, text, status: 'todo' });
  input.value = '';
  saveKey(key);
}

// ===== 챙길 것 렌더 =====
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

function updatePackingItemDOM(person, id) {
  const item = state.packing[person].find(i => i.id === id);
  if (!item) return;
  const li = document.querySelector(`#packing-${person} [data-id="${id}"]`)?.closest('.packing-item');
  if (!li) return;
  li.className = `packing-item${item.done ? ' done' : ''}`;
  const dot = li.querySelector('.priority-dot');
  dot.className = `priority-dot ${item.priority} clickable`;
  dot.title = PRIORITY_TITLE[item.priority];
  li.querySelector('input[type="checkbox"]').checked = item.done;
}

function handlePackingClick(e) {
  const dot       = e.target.closest('.priority-dot.clickable');
  const deleteBtn = e.target.closest('.delete-btn[data-person]');
  if (dot) {
    const { person, id } = dot.dataset;
    const item = state.packing[person].find(i => i.id === id);
    if (item) { item.priority = nextInCycle(PRIORITY_CYCLE, item.priority); savePackingPerson(person); updatePackingItemDOM(person, id); }
  } else if (deleteBtn) {
    const { person, id } = deleteBtn.dataset;
    state.packing[person] = state.packing[person].filter(i => i.id !== id);
    savePackingPerson(person);
  }
}

function handlePackingChange(e) {
  const cb = e.target.closest('input[type="checkbox"][data-person]');
  if (!cb) return;
  const { person, id } = cb.dataset;
  const item = state.packing[person].find(i => i.id === id);
  if (item) { item.done = cb.checked; savePackingPerson(person); updatePackingItemDOM(person, id); }
}

function addPackingItem(person) {
  const input    = document.getElementById(`packing-${person}-input`);
  const priority = document.getElementById(`packing-${person}-priority`).value;
  const text     = input.value.trim();
  if (!text) return;
  state.packing[person].push({ id: `pk-${Date.now()}`, text, priority, done: false });
  input.value = '';
  savePackingPerson(person);
}

// ===== 드래그 앤 드롭 =====
function initPackingDrag(person) {
  const ul = document.getElementById(`packing-${person}`);
  let dragSrc = null;
  ul.querySelectorAll('.packing-item').forEach(item => {
    item.querySelector('.drag-handle').addEventListener('mousedown', () => { item.draggable = true; });
    item.addEventListener('dragstart', e => {
      dragSrc = item; e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => item.classList.add('dragging'), 0);
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      ul.querySelectorAll('.packing-item').forEach(i => i.classList.remove('drag-over'));
      const newOrder = [...ul.querySelectorAll('.packing-item')].map(el => el.dataset.id);
      state.packing[person].sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
      savePackingPerson(person);
    });
    item.addEventListener('dragover', e => {
      e.preventDefault(); e.dataTransfer.dropEffect = 'move';
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

// ===== 메모 =====
function renderMemos() {
  const container = document.getElementById('memo-list');
  container.innerHTML = '';
  if (!state.memos.length) return;
  state.memos.forEach((memo, idx) => {
    const div = document.createElement('div');
    div.className = 'memo-item';
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
  state.memos.push({ title, body: '' });
  titleInput.value = '';
  saveMemos();
  setTimeout(() => {
    const textareas = document.querySelectorAll('.memo-body');
    if (textareas.length) textareas[textareas.length - 1].focus();
  }, 300);
}

function handleMemoEvents(e) {
  const deleteBtn = e.target.closest('.memo-delete');
  if (deleteBtn) {
    state.memos.splice(parseInt(deleteBtn.dataset.idx), 1);
    saveMemos();
  }
}

// 메모 입력은 debounce로 Firebase 과호출 방지
let memoDebounce = null;
function handleMemoInput(e) {
  const textarea = e.target.closest('.memo-body');
  if (!textarea) return;
  const idx = parseInt(textarea.dataset.idx);
  if (state.memos[idx]) state.memos[idx].body = textarea.value;
  clearTimeout(memoDebounce);
  memoDebounce = setTimeout(saveMemos, 800);
}

// ===== 탭 전환 =====
function switchTab(person, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`tab-${person}`).classList.add('active');
}
window.switchTab = switchTab;

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
      const today = new Date(); today.setHours(0,0,0,0);
      const days  = Math.round((new Date('2026-06-03T00:00:00') - today) / 86400000);
      const hours = Math.floor((diffMs % 86400000) / 3600000);
      const mins  = Math.floor((diffMs % 3600000)  / 60000);
      const secs  = Math.floor((diffMs % 60000)    / 1000);
      if (days > 0) {
        el.innerHTML = `<span class="dday-badge">D-${days}</span><span class="dday-sub">${hours}시간 ${mins}분 후 출발</span>`;
      } else {
        el.innerHTML = `<span class="dday-badge dday-soon">D-DAY</span><span class="dday-sub">${hours}시간 ${mins}분 ${secs}초 후 출발 🔥</span>`;
        setTimeout(update, 1000); return;
      }
    } else {
      el.innerHTML = `<span class="dday-badge ended">여행 완료 🎉</span>`;
    }
  }
  update();
  setInterval(update, 60000);
}

// ===== 이벤트 등록 =====
function initEvents() {
  TODO_KEYS.forEach(key => {
    document.getElementById(`${key}-list`).addEventListener('click', handleTodoClick);
    document.getElementById(`${key}-input`).addEventListener('keydown', e => { if (e.key === 'Enter') addItem(key); });
    document.getElementById(`${key}-add-btn`).addEventListener('click', () => addItem(key));
  });
  PACKING_KEYS.forEach(person => {
    document.getElementById(`packing-${person}`).addEventListener('click', handlePackingClick);
    document.getElementById(`packing-${person}`).addEventListener('change', handlePackingChange);
    document.getElementById(`packing-${person}-input`).addEventListener('keydown', e => { if (e.key === 'Enter') addPackingItem(person); });
    document.getElementById(`packing-${person}-add-btn`).addEventListener('click', () => addPackingItem(person));
  });
  document.getElementById('memo-add-btn').addEventListener('click', addMemo);
  document.getElementById('memo-title-input').addEventListener('keydown', e => { if (e.key === 'Enter') addMemo(); });
  document.getElementById('memo-list').addEventListener('click', handleMemoEvents);
  document.getElementById('memo-list').addEventListener('input', handleMemoInput);
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', async () => {
  initDday();
  initEvents();
  await initFirebaseData(); // 첫 실행 시 초기 데이터 세팅
  subscribeAll();           // 실시간 구독 시작
});
