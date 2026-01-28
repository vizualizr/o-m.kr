/**
 * o-m.kr Site-wide configuration
 */

export const SITE_CONFIG = {
    title: "o-m.kr",
    description: "데이터 저널리즘 & 스토리텔링 프로젝트",
    author: "Your Name",
    url: "https://o-m.kr",
    base: "/",

    // Google Sheets API 설정
    googleSheets: {
        // See .env for GOOGLE_SHEET_ID
        sheetId: import.meta.env.GOOGLE_SHEET_ID || "default-sheet-id",
        range: "Articles!A:Z", // 데이터를 가져올 시트 범위
    },

    // Content Classification System (equivalent to Enum, yet to be confirmed)
    categories: ["정치", "경제", "사회", "기술", "문화"] as const, // not confirmed
    contentTypes: ["page", "article", "poster"] as const, // not confirmed

    // UI/UX configuration
    pagination: {
        pageSize: 10,
    },

    // Social media and contact information
    social: {
        github: "your-github-handle",
        email: "[EMAIL_ADDRESS]",
    }
} as const;

export type SiteConfig = typeof SITE_CONFIG;