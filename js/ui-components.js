// UI 元件產生器
import { vspoJPMembers, otherMemberGroups } from './state.js';

export function createErrorDisplay(error) {
    const container = document.createElement('div');
    let errorMessage = error;
    let errorHint = "請檢查代理伺服器是否正常運作，或稍後再試。";
    if (error && error.toLowerCase().includes('quota')) {
        errorMessage = "API 每日配額已用盡";
        errorHint = "請等待台灣時間下午 4 點後，配額將會自動重置。";
    }
    container.className = "bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-center";
    container.innerHTML = `<strong class="font-bold">發生錯誤！</strong><p class="block sm:inline ml-2">${errorMessage}</p><p class="mt-2 text-sm">${errorHint}</p>`;
    return container;
}

export function createVideoCard(video, showChannel = true) {
    const formatNumber = (num) => (typeof num !== 'number') ? 'N/A' : num >= 10000 ? `${(num / 10000).toFixed(1)}萬` : num.toLocaleString();
    const timeAgo = (dateStr) => {
        const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
        const intervals = { '年': 31536000, '個月': 2592000, '天': 86400, '小時': 3600, '分鐘': 60 };
        for (let unit in intervals) {
            if (seconds / intervals[unit] > 1) return `${Math.floor(seconds / intervals[unit])} ${unit}前`;
        }
        return "剛剛";
    };
    const card = document.createElement('div');
    card.className = "group bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-400/30 transition-shadow duration-300 flex flex-col video-card";
    const videoContainer = document.createElement('div');
    videoContainer.className = "block w-full aspect-video bg-gray-700 overflow-hidden relative";
    const thumbImg = document.createElement('img');
    thumbImg.src = video.thumbnail;
    thumbImg.alt = video.title;
    thumbImg.className = "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105";
    thumbImg.onerror = function() { this.onerror=null; this.src='https://placehold.co/480x360/1a202c/e53e3e?text=Image+Error'; };
    videoContainer.appendChild(thumbImg);
    let iframe = null;
    // 將 hover 事件從 videoContainer 移到 card
    card.addEventListener('mouseenter', () => {
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&controls=2&fs=0&modestbranding=1&rel=0&disablekb=1&cc_load_policy=1`;
            iframe.frameBorder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay";
            iframe.allowFullscreen = true;
            iframe.setAttribute('allowfullscreen', ''); // 兼容瀏覽器全螢幕
            iframe.className = "w-full h-full absolute inset-0";
            videoContainer.appendChild(iframe);
            thumbImg.style.visibility = 'hidden';
        }
    });
    card.addEventListener('mouseleave', () => {
        if (iframe) {
            videoContainer.removeChild(iframe);
            iframe = null;
            thumbImg.style.visibility = '';
        }
    });
    const channelLink = showChannel ? `
        <a href="https://www.youtube.com/channel/${video.channelId}" target="_blank" rel="noopener noreferrer" class="flex items-center space-x-2 mt-2">
            <img src="${video.channelAvatarUrl}" class="w-6 h-6 rounded-full bg-gray-700">
            <p class="text-sm text-gray-400 hover:text-white transition-colors truncate">${video.channelTitle}</p>
        </a>` : '';
    card.appendChild(videoContainer);
    const infoDiv = document.createElement('div');
    infoDiv.className = "p-4 flex flex-col flex-grow";
    infoDiv.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer" class="flex-grow">
            <h3 class="font-bold text-lg text-gray-100 leading-tight hover:text-cyan-400 transition-colors">${video.title}</h3>
        </a>
        ${channelLink}
        <div class="flex justify-between items-center text-sm text-gray-400 mt-3 pt-3 border-t border-gray-700">
            <span>${formatNumber(video.viewCount)} 次觀看</span>
            <span>${timeAgo(video.publishedAt)}</span>
        </div>
    `;
    card.appendChild(infoDiv);
    return card;
}

export function createVideoListItem(video) {
    const formatNumber = (num) => (typeof num !== 'number') ? 'N/A' : num >= 10000 ? `${(num / 10000).toFixed(1)}萬` : num.toLocaleString();
    const timeAgo = (dateStr) => {
        const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
        const intervals = { '年': 31536000, '個月': 2592000, '天': 86400, '小時': 3600, '分鐘': 60 };
        for (let unit in intervals) {
            if (seconds / intervals[unit] > 1) return `${Math.floor(seconds / intervals[unit])} ${unit}前`;
        }
        return "剛剛";
    };
    const item = document.createElement('div');
    item.className = "flex items-center space-x-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200";
    const videoContainer = document.createElement('div');
    videoContainer.className = "flex-shrink-0 w-32 aspect-video bg-gray-700 rounded-md overflow-hidden relative";
    const thumbImg = document.createElement('img');
    thumbImg.src = video.thumbnail;
    thumbImg.alt = video.title;
    thumbImg.className = "w-full h-full object-cover";
    thumbImg.onerror = function() { this.onerror=null; this.src='https://placehold.co/128x72/1a202c/e53e3e?text=Error'; };
    videoContainer.appendChild(thumbImg);
    // 移除 hover 預覽功能（iframe）
    item.appendChild(videoContainer);
    const infoDiv = document.createElement('div');
    infoDiv.className = "flex-1 min-w-0";
    infoDiv.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer">
            <h3 class="font-semibold text-gray-100 truncate hover:text-cyan-400">${video.title}</h3>
        </a>
        <a href="https://www.youtube.com/channel/${video.channelId}" target="_blank" rel="noopener noreferrer" class="flex items-center space-x-2 mt-1">
            <img src="${video.channelAvatarUrl}" class="w-5 h-5 rounded-full bg-gray-700">
            <p class="text-sm text-gray-400 hover:text-white truncate">${video.channelTitle}</p>
        </a>
        <div class="flex justify-between items-center text-xs text-gray-500 mt-2">
            <span>${formatNumber(video.viewCount)} 次觀看</span>
            <span>${timeAgo(video.publishedAt)}</span>
        </div>
    `;
    item.appendChild(infoDiv);
    return item;
}

export function createChannelGridCard(channel) {
    const formatNumber = (num) => (typeof num !== 'number') ? 'N/A' : num >= 10000 ? `${(num / 10000).toFixed(1)}萬` : num.toLocaleString();
    const timeAgo = (dateStr) => {
        const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
        const intervals = { '年': 31536000, '個月': 2592000, '天': 86400, '小時': 3600, '分鐘': 60 };
        for (let unit in intervals) {
            if (seconds / intervals[unit] > 1) return `${Math.floor(seconds / intervals[unit])} ${unit}前`;
        }
        return "剛剛";
    };
    const card = document.createElement('div');
    card.className = "group rounded-lg overflow-hidden shadow-lg hover:shadow-purple-400/30 transition-shadow duration-300 relative";
    card.style.backgroundImage = `url('${channel.avatarUrl}')`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';
    const video = channel.latestVideo;
    card.innerHTML = `
        <div class="absolute inset-0 bg-gray-900/70 backdrop-blur"></div>
        <div class="relative z-10 flex flex-col h-full">
            <div class="p-4">
                <div class="flex items-center space-x-3">
                    <a href="https://www.youtube.com/channel/${channel.id}" target="_blank" rel="noopener noreferrer" class="flex-shrink-0">
                        <img src="${channel.avatarUrl}" alt="${channel.name}" class="w-12 h-12 rounded-full bg-gray-700 border-2 border-white/20">
                    </a>
                    <div class="flex-1 min-w-0">
                        <a href="https://www.youtube.com/channel/${channel.id}" target="_blank" rel="noopener noreferrer">
                            <p class="text-lg font-bold text-purple-300 truncate">${channel.name}</p>
                        </a>
                        <p class="text-sm text-gray-300">${formatNumber(channel.subscriberCount)} 位訂閱者</p>
                    </div>
                    <button class="channel-filter-btn flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" data-channel-id="${channel.id}" data-channel-name="${channel.name}" title="篩選此頻道">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 12.414V17a1 1 0 01-1.447.894l-3-2A1 1 0 017 15V12.414L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="px-4 text-sm text-gray-400">最新影片:</div>
            <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer" class="block w-full aspect-video bg-gray-700/50 overflow-hidden mt-2">
                <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onerror="this.onerror=null;this.src='https://placehold.co/480x360/1a202c/e53e3e?text=Image+Error';">
            </a>
            <div class="p-4 flex flex-col flex-grow mt-auto">
                <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer" class="flex-grow">
                    <h3 class="font-bold text-lg text-gray-100 leading-tight hover:text-cyan-400 transition-colors">${video.title}</h3>
                </a>
                <div class="flex justify-between items-center text-sm text-gray-300 mt-3 pt-3 border-t border-gray-500/50">
                    <span>${formatNumber(video.viewCount)} 次觀看</span>
                    <span>${timeAgo(video.publishedAt)}</span>
                </div>
            </div>
        </div>
    `;
    return card;
}

export function isColorLight(hexColor) {
    if (!hexColor) return false;
    const color = (hexColor.charAt(0) === '#') ? hexColor.substring(1, 7) : hexColor;
    if (color.length < 6) return false;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
}

export function createMemberFilterListHTML(jpMembers, otherGroups, activeFilter) {
    const listContainer = document.createElement('div');
    listContainer.className = 'flex flex-row space-x-2 md:flex-col md:space-y-2 md:space-x-0 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0';
    listContainer.id = 'member-filter-list-container';
    const allBtn = document.createElement('button');
    allBtn.className = `filter-btn flex-shrink-0 ${activeFilter === 'all' ? 'active' : ''}`;
    allBtn.dataset.filter = 'all';
    allBtn.textContent = '顯示全部';
    listContainer.appendChild(allBtn);
    const createMemberButton = (member) => {
        const btn = document.createElement('button');
        const isActive = activeFilter === member.filter_keyword;
        btn.className = `filter-btn flex-shrink-0 ${isActive ? 'active' : ''}`;
        btn.dataset.filter = member.filter_keyword;
        btn.style.backgroundColor = member.color;
        if (member.forceWhiteText) {
            btn.style.color = '#FFFFFF';
        } else {
            btn.style.color = isColorLight(member.color) ? '#1f2937' : '#f9fafb';
        }
        btn.textContent = member.name_jp;
        return btn;
    };
    jpMembers.forEach(member => listContainer.appendChild(createMemberButton(member)));
    for (const groupName in otherGroups) {
        const divider = document.createElement('div');
        divider.className = 'text-xs text-gray-500 pt-2 pb-1 pl-2 md:pt-3 md:pb-1 whitespace-nowrap';
        divider.textContent = groupName;
        listContainer.appendChild(divider);
        otherGroups[groupName].forEach(member => listContainer.appendChild(createMemberButton(member)));
    }
    return listContainer;
}

export function createSkeleton(type) {
    const skeleton = document.createElement('div');
    if (type === 'card') {
        skeleton.className = "bg-gray-800 rounded-lg overflow-hidden shadow-lg flex flex-col";
        skeleton.innerHTML = `<div class="w-full aspect-video bg-gray-700 animate-pulse"></div><div class="p-4"><div class="h-4 bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div><div class="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div></div>`;
    } else if (type === 'list') {
        skeleton.className = "flex items-center space-x-4 p-3 bg-gray-800 rounded-lg animate-pulse";
        skeleton.innerHTML = `<div class="w-32 h-[72px] bg-gray-700 rounded-md"></div><div class="flex-1 space-y-2"><div class="h-4 bg-gray-700 rounded w-5/6"></div><div class="h-4 bg-gray-700 rounded w-1/3"></div><div class="h-3 bg-gray-700 rounded w-1/2"></div></div>`;
    }
    return skeleton;
}

export function createPaginationControls(totalPages, currentPage) {
    const container = document.createElement('div');
    container.className = 'flex justify-center items-center space-x-1 md:space-x-2 mt-8';
    const createBtn = (text, page, isDisabled = false, isActive = false) => {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${isActive ? 'active' : ''}`;
        btn.textContent = text;
        btn.dataset.page = page;
        if (isDisabled) btn.disabled = true;
        return btn;
    };
    const createEllipsis = () => {
        const span = document.createElement('span');
        span.className = 'pagination-ellipsis';
        span.textContent = '...';
        return span;
    };
    container.appendChild(createBtn('‹', currentPage - 1, currentPage === 1));
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            container.appendChild(createBtn(i, i, false, i === currentPage));
        }
    } else {
        const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
        const sortedPages = Array.from(pages).filter(p => p > 0 && p <= totalPages).sort((a, b) => a - b);
        let lastPage = 0;
        for (const page of sortedPages) {
            if (lastPage !== 0 && page - lastPage > 1) {
                container.appendChild(createEllipsis());
            }
            container.appendChild(createBtn(page, page, false, page === currentPage));
            lastPage = page;
        }
    }
    container.appendChild(createBtn('›', currentPage + 1, currentPage === totalPages));
    return container;
}
