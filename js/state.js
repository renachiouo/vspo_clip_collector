// 狀態管理與全域變數
export const CURRENT_APP_VERSION = 'V6.8';
export const PROXY_ENDPOINT = 'https://vspo-proxy-git-main-renas-projects-c8ce958b.vercel.app';

export let state = {
    allVideos: [],
    isLoading: true,
    lastUpdated: null,
    apiError: null,
    totalVisits: 0,
    todayVisits: 0,
    activeView: 'latest',
    currentPage: 1,
    itemsPerPage: 10,
    activeMemberFilter: 'all',
    activeChannelFilter: null,
};

export const vspoJPMembers = [
    {"name_jp": "花芽すみれ", "filter_keyword": "花芽すみれ", "color": "#b0c4de"},
    {"name_jp": "花芽なずな", "filter_keyword": "花芽なずな", "color": "#fabedc"},
    {"name_jp": "小雀とと", "filter_keyword": "小雀とと", "color": "#f5eb4a"},
    {"name_jp": "一ノ瀬うるは", "filter_keyword": "一ノ瀬うるは", "color": "#4182fa"},
    {"name_jp": "胡桃のあ", "filter_keyword": "胡桃のあ", "color": "#ffdbfe"},
    {"name_jp": "兎咲ミミ", "filter_keyword": "兎咲ミミ", "color": "#c7b2d6"},
    {"name_jp": "空澄セナ", "filter_keyword": "空澄セナ", "color": "#ffffff"},
    {"name_jp": "橘ひなの", "filter_keyword": "橘ひなの", "color": "#fa96c8"},
    {"name_jp": "英リサ", "filter_keyword": "英リサ", "color": "#d1de79"},
    {"name_jp": "如月れん", "filter_keyword": "如月れん", "color": "#be2152"},
    {"name_jp": "神成きゅぴ", "filter_keyword": "神成きゅぴ", "color": "#ffd23c"},
    {"name_jp": "八雲べに", "filter_keyword": "八雲べに", "color": "#85cab3"},
    {"name_jp": "藍沢エマ", "filter_keyword": "藍沢エマ", "color": "#b4f1f9"},
    {"name_jp": "紫宮るな", "filter_keyword": "紫宮るな", "color": "#d6adff"},
    {"name_jp": "猫汰つな", "filter_keyword": "猫汰つな", "color": "#ff3652"},
    {"name_jp": "白波らむね", "filter_keyword": "白波らむね", "color": "#8eced9"},
    {"name_jp": "小森めと", "filter_keyword": "小森めと", "color": "#fba03f"},
    {"name_jp": "夢野あかり", "filter_keyword": "夢野あかり", "color": "#ff998d"},
    {"name_jp": "夜乃くろむ", "filter_keyword": "夜乃くろむ", "color": "#909ec8"},
    {"name_jp": "紡木こかげ", "filter_keyword": "紡木こかげ", "color": "#5195e1"},
    {"name_jp": "千燈ゆうひ", "filter_keyword": "千燈ゆうひ", "color": "#ed784a"},
    {"name_jp": "蝶屋はなび", "filter_keyword": "蝶屋はなび", "color": "#ea5506"},
    {"name_jp": "甘結もか", "filter_keyword": "甘結もか", "color": "#eca0aa"}
];

export const otherMemberGroups = {
    "VSPO! EN": [
        {"name_jp": "Arya Kuroha", "filter_keyword": "Arya", "color": "#000000", "forceWhiteText": true},
        {"name_jp": "Jira Jisaki", "filter_keyword": "Jira", "color": "#606D3D", "forceWhiteText": true},
        {"name_jp": "Narin Mikure", "filter_keyword": "Narin", "color": "#F3A6EF", "forceWhiteText": true},
        {"name_jp": "Riko Solari", "filter_keyword": "Riko", "color": "#9373D7", "forceWhiteText": true}
    ],
    "VSPO! CN": [
        {"name_jp": "小针彩", "filter_keyword": "小针彩", "color": "#FE688D", "forceWhiteText": true},
        {"name_jp": "白咲露理", "filter_keyword": "白咲露理", "color": "#E9E5E6", "forceWhiteText": true},
        {"name_jp": "帕妃", "filter_keyword": "帕妃", "color": "#9F0019", "forceWhiteText": true},
        {"name_jp": "千郁郁", "filter_keyword": "千郁郁", "color": "#8986C0", "forceWhiteText": true}
    ]
};

export const allMembers = [...vspoJPMembers, ...Object.values(otherMemberGroups).flat()];
