// 畫面渲染與主流程
import { state, vspoJPMembers, otherMemberGroups, allMembers, CURRENT_APP_VERSION } from './state.js';
import { createErrorDisplay, createVideoCard, createVideoListItem, createChannelGridCard, createMemberFilterListHTML, createSkeleton, createPaginationControls } from './ui-components.js';
import { fetchAllDataFromProxy } from './api.js';
import { setupEventListeners } from './events.js';

const appContainer = document.getElementById('app');

export function render(onRenderComplete) {
    const { allVideos, isLoading, lastUpdated, apiError, totalVisits, todayVisits, activeView, currentPage, itemsPerPage, activeMemberFilter, activeChannelFilter } = state;
    appContainer.innerHTML = '';

    const header = document.createElement('header');
    header.className = "text-center pt-8 mb-8";
    header.innerHTML = `
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-400 flex justify-center items-baseline flex-wrap gap-x-3 px-4">
            <span><span class="secret-trigger" data-char="れ">れ</span><span class="secret-trigger" data-char="な">な</span><span class="secret-trigger" data-char="ち">ち</span>的VSPO中文精華收集處</span>
            <span class="text-lg align-middle text-gray-500 whitespace-nowrap">${CURRENT_APP_VERSION}</span>
        </h1>
    `;

    const topBar = document.createElement('div');
    topBar.className = "sticky top-0 z-20 bg-gray-900/80 backdrop-blur-sm py-4 mb-8";
    topBar.innerHTML = `
        <div class="container mx-auto px-4 text-center text-sm text-gray-500 flex justify-center items-center space-x-4 flex-wrap gap-y-2">
            <span class="whitespace-nowrap">👀 總人次: <span class="font-semibold text-teal-400">${totalVisits.toLocaleString()}</span></span>
            <span class="whitespace-nowrap">☀️ 今日人次: <span class="font-semibold text-amber-400">${todayVisits.toLocaleString()}</span></span>
            ${lastUpdated ? `<span class="whitespace-nowrap">資料時間: ${lastUpdated.toLocaleTimeString()}</span>` : ''}
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSdPXcKRZdp6KgVcw_yiXhDy979wrl3y42knIh5fIjP1tGUZBQ/viewform?usp=sharing&ouid=104059498550822009260" target="_blank" rel="noopener noreferrer" class="whitespace-nowrap font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                回報遺漏頻道/影片
            </a>
            <button id="check-update-btn" class="whitespace-nowrap font-semibold text-cyan-400 hover:text-cyan-300 transition-colors duration-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zM9 13a1 1 0 112 0 1 1 0 01-2 0z" clip-rule="evenodd" /></svg>
                檢查更新
            </button>
        </div>`;

    const mainGrid = document.createElement('div');
    mainGrid.className = "container mx-auto px-4 grid grid-cols-1 md:grid-cols-[12rem_minmax(0,1fr)] gap-8";

    const filterSection = document.createElement('aside');
    filterSection.className = "md:col-start-1";
    const filterContainer = document.createElement('div');
    filterContainer.className = "bg-gray-800/50 p-4 rounded-lg md:sticky md:top-28 md:flex md:flex-col md:max-h-[calc(100vh-9rem)]";
    filterContainer.innerHTML = `<h3 class="text-xl font-bold mb-4 text-gray-300 border-b border-gray-600 pb-2">成員篩選</h3>`;
    filterContainer.appendChild(createMemberFilterListHTML(vspoJPMembers, otherMemberGroups, activeMemberFilter));
    filterSection.appendChild(filterContainer);

    const rightContent = document.createElement('main');
    rightContent.className = "md:col-start-2 min-w-0";

    if (isLoading) {
        const videoSkeletons = Array.from({ length: 10 }).map(() => createSkeleton('card').outerHTML).join('');
        rightContent.innerHTML = `<section style="min-height: 720px;"><div class="flex items-center justify-between mb-6"><div class="h-8 bg-gray-700 rounded w-1/3 animate-pulse"></div><div class="h-8 bg-gray-700 rounded w-1/4 animate-pulse"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">${videoSkeletons}</div></section>`;
    } else if (apiError) {
        rightContent.appendChild(createErrorDisplay(apiError));
    } else {
        let filteredVideos = allVideos;
        if (activeChannelFilter) {
            filteredVideos = allVideos.filter(video => video.channelId === activeChannelFilter.id);
        } else if (activeMemberFilter !== 'all') {
            filteredVideos = allVideos.filter(video => video.title.toLowerCase().includes(activeMemberFilter.toLowerCase()));
        }

        if (filteredVideos.length === 0 && (activeMemberFilter !== 'all' || activeChannelFilter)) {
            const filterName = activeChannelFilter ? activeChannelFilter.name : activeMemberFilter;
            rightContent.innerHTML = `<p class="text-center text-gray-400 p-8 bg-gray-800 rounded-lg">找不到關於「${filterName}」的影片。</p>`;
        } else {
            const videosSection = document.createElement('section');
            videosSection.id = 'videos-section';

            if (activeChannelFilter) {
                const filterBanner = document.createElement('div');
                filterBanner.className = 'flex items-center justify-between bg-purple-900/50 text-purple-200 px-4 py-2 rounded-lg mb-6';
                filterBanner.innerHTML = `
                    <span>目前篩選中：<strong class="font-semibold">${activeChannelFilter.name}</strong></span>
                    <button id="clear-channel-filter-btn" class="p-1 rounded-full hover:bg-white/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </button>
                `;
                videosSection.appendChild(filterBanner);
            }

            const videosHeader = document.createElement('div');
            videosHeader.className = "flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6";
            const latestButtonText = window.innerWidth >= 1280 ? '最新12部' : '最新10部';
            videosHeader.innerHTML = `
                <div class="flex items-center mb-4 sm:mb-0">
                    <h2 class="text-3xl font-bold border-l-4 border-cyan-400 pl-4">精華影片</h2>
                    <div class="tooltip ml-2">
                        <button class="text-sm bg-gray-600 text-gray-300 rounded-full w-5 h-5 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-cyan-400" aria-label="說明">?</button>
                        <div class="tooltiptext">
                            <p class="font-semibold mb-2">說明：</p>
                            <p>1. 伺服器快取每 30 分鐘更新一次</p>
                            <p>2. 為關鍵字搜尋，故可能出現：</p>
                            <div class="pl-4">
                                <p>a. 含VSPO關鍵字的非VSPO烤肉</p>
                                <p>b. 含中文關鍵字的外文剪輯</p>
                                <p class="mt-2">有以上情形請至頁首回報處回報</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex space-x-2 self-start sm:self-center"><button id="view-latest-btn" class="tab-btn ${activeView === 'latest' ? 'active' : ''}">${latestButtonText}</button><button id="view-all-btn" class="tab-btn ${activeView === 'all' ? 'active' : ''}">一個月內</button></div>`;
            videosSection.appendChild(videosHeader);

            const viewContainer = document.createElement('div');
            viewContainer.style.minHeight = '720px';
            const videosToDisplay = filteredVideos;

            if (activeView === 'latest') {
                const grid = document.createElement('div');
                grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6';
                const sliceCount = window.innerWidth >= 1280 ? 12 : 10;
                videosToDisplay.slice(0, sliceCount).forEach(video => grid.appendChild(createVideoCard(video)));
                viewContainer.appendChild(grid);
            } else {
                const listContainer = document.createElement('div');
                listContainer.className = 'space-y-3';
                const totalPages = Math.ceil(videosToDisplay.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedVideos = videosToDisplay.slice(startIndex, startIndex + itemsPerPage);
                paginatedVideos.forEach(video => listContainer.appendChild(createVideoListItem(video)));
                viewContainer.appendChild(listContainer);
                if (totalPages > 1) {
                    viewContainer.appendChild(createPaginationControls(totalPages, currentPage));
                }
            }
            videosSection.appendChild(viewContainer);
            rightContent.appendChild(videosSection);
        }

        const channelListSection = document.createElement('section');
        const channelListHeader = document.createElement('div');
        channelListHeader.className = 'flex items-baseline mb-6 gap-x-3';
        const videosForChannelList = activeMemberFilter !== 'all'
            ? allVideos.filter(video => video.title.toLowerCase().includes(activeMemberFilter.toLowerCase()))
            : allVideos;
        if (activeMemberFilter !== 'all') {
            const member = allMembers.find(m => m.filter_keyword === activeMemberFilter);
            const memberColor = member ? member.color : '#fbbf24';
            channelListHeader.innerHTML = `<h2 class="text-3xl font-bold border-l-4 border-purple-400 pl-4 mt-12">一個月內發布過 <span style="color: ${memberColor}">${member ? member.name_jp : activeMemberFilter}</span> 剪輯的頻道</h2>`;
        } else {
            channelListHeader.innerHTML = `<h2 class="text-3xl font-bold border-l-4 border-purple-400 pl-4 mt-12">精華頻道列表</h2><p class="text-gray-500 text-sm">僅列出30天內有發布新影片之頻道</p>`;
        }
        channelListSection.appendChild(channelListHeader);
        const channels = {};
        videosForChannelList.forEach(video => {
            if (!channels[video.channelId]) {
                channels[video.channelId] = { id: video.channelId, name: video.channelTitle, subscriberCount: video.subscriberCount, latestVideo: video, avatarUrl: video.channelAvatarUrl };
            }
        });
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const channelData = Object.values(channels)
            .filter(channel => new Date(channel.latestVideo.publishedAt) > thirtyDaysAgo)
            .sort((a, b) => new Date(b.latestVideo.publishedAt) - new Date(a.latestVideo.publishedAt));
        if (channelData.length > 0) {
            const channelListGrid = document.createElement('div');
            channelListGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6';
            channelData.forEach(channel => channelListGrid.appendChild(createChannelGridCard(channel)));
            channelListSection.appendChild(channelListGrid);
        } else if (activeMemberFilter !== 'all') {
            channelListSection.innerHTML += `<p class="text-center text-gray-400 p-8 bg-gray-800 rounded-lg">找不到一個月內發布過「${activeMemberFilter}」剪輯的頻道。</p>`;
        }
        rightContent.appendChild(channelListSection);
    }

    mainGrid.appendChild(filterSection);
    mainGrid.appendChild(rightContent);
    appContainer.appendChild(header);
    appContainer.appendChild(topBar);
    appContainer.appendChild(mainGrid);

    setupEventListeners();
    if (onRenderComplete) {
        onRenderComplete();
    }
}

export async function initializeApp(force = false, password = '', mode = 'normal') {
    state.isLoading = true;
    render();
    try {
        const dataPackage = await fetchAllDataFromProxy(force, password, mode);
        state.allVideos = dataPackage.videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        state.lastUpdated = new Date(dataPackage.timestamp);
        state.totalVisits = dataPackage.totalVisits || 0;
        state.todayVisits = dataPackage.todayVisits || 0;
    } catch (error) {
        console.error("初始化失敗:", error);
        state.apiError = error.message;
        if (force) alert(`錯誤: ${error.message}`);
    } finally {
        state.isLoading = false;
        render();
    }
}

// 頁面載入時自動初始化
initializeApp();
