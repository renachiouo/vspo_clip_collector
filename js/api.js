// API 資料存取
import { PROXY_ENDPOINT } from './state.js';

export async function fetchAllDataFromProxy(force = false, password = '', mode = 'normal') {
    const url = new URL(`${PROXY_ENDPOINT}/api/youtube`);
    if (force) {
        url.searchParams.append('force_refresh', 'true');
        url.searchParams.append('password', password);
        if (mode === 'deep') {
            url.searchParams.append('mode', 'deep');
        }
    }
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
    return data;
}

// --- 更新檢查相關函式 ---
export function showUpdateModal(title, message, showDownloadButton = false) {
    const existingModal = document.getElementById('update-modal');
    if (existingModal) existingModal.remove();

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'update-modal';
    modalOverlay.className = 'modal-overlay';
    
    let downloadButtonHTML = '';
    if (showDownloadButton) {
        downloadButtonHTML = `<a href="https://github.com/renachiouo/vspo_clip_collector/releases" target="_blank" rel="noopener noreferrer" class="mt-6 block w-full text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">前往下載頁面</a>`;
    }

    modalOverlay.innerHTML = `
        <div class="modal-content">
            <h3 class="text-2xl font-bold text-cyan-400 mb-4">${title}</h3>
            <p class="text-gray-300">${message}</p>
            ${downloadButtonHTML}
            <button id="close-modal-btn" class="mt-4 block w-full text-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors">關閉</button>
        </div>
    `;

    document.body.appendChild(modalOverlay);
    
    setTimeout(() => modalOverlay.classList.add('visible'), 10);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay || e.target.id === 'close-modal-btn' || e.target.closest('#close-modal-btn')) {
            modalOverlay.classList.remove('visible');
            setTimeout(() => modalOverlay.remove(), 300);
        }
    });
}

export async function checkForUpdates(CURRENT_APP_VERSION, showUpdateModal) {
    showUpdateModal('檢查更新中...', '正在從 GitHub 獲取最新版本資訊，請稍候...');
    try {
        const response = await fetch('https://api.github.com/repos/renachiouo/vspo_clip_collector/commits?per_page=1');
        if (!response.ok) throw new Error(`GitHub API 請求失敗 (${response.status})`);
        const data = await response.json();
        const latestCommitMessage = data[0]?.commit?.message || '';
        const versionMatch = latestCommitMessage.match(/V(\d+\.\d+(\.\d+)?)/);
        const latestVersion = versionMatch ? `V${versionMatch[1]}` : null;
        if (!latestVersion) throw new Error('無法從最新的 commit 中解析版本號。');
        if (latestVersion === CURRENT_APP_VERSION) {
            showUpdateModal('檢查完成', `您目前使用的已是最新版本 (${CURRENT_APP_VERSION})。`);
        } else {
            showUpdateModal(
                '發現新版本！',
                `目前最新版本為 <strong>${latestVersion}</strong>，您使用的版本為 ${CURRENT_APP_VERSION}。<br><br>建議更新以獲取最新的功能與修正。`,
                true
            );
        }
    } catch (error) {
        console.error('檢查更新時發生錯誤:', error);
        showUpdateModal('檢查失敗', `無法完成更新檢查，請稍後再試。<br>錯誤訊息: ${error.message}`);
    }
}
