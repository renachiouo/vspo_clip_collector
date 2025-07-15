// 事件處理
import { state } from './state.js';
import { render, initializeApp } from './render.js';

export function setupSecretTrigger() {
    let sequence = [];
    let lastClickTime = 0;
    const targetSequence = ['れ', 'な', 'ち'];
    document.querySelectorAll('.secret-trigger').forEach(span => {
        span.addEventListener('click', (e) => {
            const char = e.target.dataset.char;
            const now = Date.now();
            if (now - lastClickTime > 3000) sequence = [];
            sequence.push(char);
            lastClickTime = now;
            if (sequence.join('') === targetSequence.join('')) {
                console.log("秘密通道已觸發！");
                const input = prompt("請輸入管理員密碼：");
                if (input) {
                    const parts = input.split(',');
                    const password = parts[0];
                    const mode = parts[1] === 'deep' ? 'deep' : 'normal';
                    alert(`正在以 ${mode} 模式執行更新...`);
                    initializeApp(true, password, mode);
                }
                sequence = [];
            }
            if (sequence.length >= targetSequence.length && sequence.join('') !== targetSequence.join('')) {
                sequence = [];
            }
        });
    });
}

export function setupEventListeners() {
    setupSecretTrigger();
    document.getElementById('check-update-btn')?.addEventListener('click', () => {
        import('./api.js').then(({ checkForUpdates, showUpdateModal }) => {
            import('./state.js').then(({ CURRENT_APP_VERSION }) => {
                checkForUpdates(CURRENT_APP_VERSION, showUpdateModal);
            });
        });
    });
    document.getElementById('view-latest-btn')?.addEventListener('click', () => {
        state.activeView = 'latest';
        render();
    });
    document.getElementById('view-all-btn')?.addEventListener('click', () => {
        state.activeView = 'all';
        state.currentPage = 1;
        render();
    });
    document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = parseInt(e.currentTarget.dataset.page, 10);
            if (page && page !== state.currentPage) {
                state.currentPage = page;
                render(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        });
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterList = document.getElementById('member-filter-list-container');
            const scrollPosition = {
                top: filterList ? filterList.scrollTop : 0,
                left: filterList ? filterList.scrollLeft : 0
            };
            state.activeChannelFilter = null;
            state.activeMemberFilter = e.currentTarget.dataset.filter;
            state.currentPage = 1;
            render(() => {
                const newFilterList = document.getElementById('member-filter-list-container');
                if (newFilterList) {
                    newFilterList.scrollTop = scrollPosition.top;
                    newFilterList.scrollLeft = scrollPosition.left;
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    });
    document.querySelectorAll('.channel-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            state.activeMemberFilter = 'all';
            state.activeChannelFilter = {
                id: button.dataset.channelId,
                name: button.dataset.channelName,
            };
            state.currentPage = 1;
            render(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    });
    document.getElementById('clear-channel-filter-btn')?.addEventListener('click', () => {
        state.activeChannelFilter = null;
        render();
    });
    window.addEventListener('resize', () => {
        if (state.activeView === 'latest') {
            render();
        }
    });
}

// 頁面載入時自動綁定事件
setupEventListeners();
