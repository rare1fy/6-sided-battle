/**
 * 全局类型声明 — Cocos Creator 版
 *
 * 替代 PixiJS 版的 global.d.ts（已去除 React 依赖）
 */

/** 微信小游戏 API 类型声明 */
declare const wx: {
    setStorage: (options: { key: string; data: unknown }) => void;
    getStorage: (options: { key: string; success: (res: { data: unknown }) => void; fail: () => void }) => void;
    removeStorage: (options: { key: string }) => void;
    showToast: (options: { title: string; icon?: string; duration?: number }) => void;
    showModal: (options: { title: string; content: string; success?: (res: { confirm: boolean }) => void }) => void;
    getSystemInfoSync: () => { screenWidth: number; screenHeight: number; pixelRatio: number; platform: string };
    onShow: (callback: () => void) => void;
    onHide: (callback: () => void) => void;
};

/** 抖音小游戏 API 类型声明 */
declare const tt: {
    setStorage: (options: { key: string; data: unknown }) => void;
    getStorage: (options: { key: string; success: (res: { data: unknown }) => void; fail: () => void }) => void;
    showToast: (options: { title: string; icon?: string; duration?: number }) => void;
    getSystemInfoSync: () => { model: string; screenWidth: number; screenHeight: number; pixelRatio: number };
    onShow: (callback: () => void) => void;
    onHide: (callback: () => void) => void;
    checkScene: (options: { scene: string; success: (res: { isExist: boolean }) => void }) => void;
    navigateToScene: (options: { scene: string }) => void;
};
