/**
 * AudioManager — 全局音频管理器（Cocos Autoload 单例）
 *
 * 职责：
 * 1. BGM 播放/切换/淡入淡出
 * 2. SFX 播放（playOneShot）
 * 3. 音量控制 / 静音
 * 4. 前后台切换自动暂停/恢复
 *
 * 替代 PixiJS 版的 engine/soundPlayer.ts
 */

import { _decorator, Component, AudioSource, AudioClip, resources, director, game, Game, assetManager } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    private static _instance: AudioManager | null = null;

    public static get instance(): AudioManager {
        return AudioManager._instance!;
    }

    @property(AudioSource)
    bgmSource: AudioSource = null!;

    @property(AudioSource)
    sfxSource: AudioSource = null!;

    private _bgmVolume: number = 0.5;
    private _sfxVolume: number = 0.7;
    private _muted: boolean = false;

    // ── 生命周期 ──

    protected onLoad(): void {
        if (AudioManager._instance && AudioManager._instance !== this) {
            this.node.destroy();
            return;
        }
        AudioManager._instance = this;
        director.addPersistRootNode(this.node);

        // 前后台切换
        game.on(Game.EVENT_HIDE, this._onHide, this);
        game.on(Game.EVENT_SHOW, this._onShow, this);
    }

    protected onDestroy(): void {
        game.off(Game.EVENT_HIDE, this._onHide, this);
        game.off(Game.EVENT_SHOW, this._onShow, this);
        if (AudioManager._instance === this) {
            AudioManager._instance = null;
        }
    }

    // ── BGM ──

    public playBGM(clipPath: string, loop: boolean = true): void {
        this._loadClip(clipPath, (clip) => {
            this.bgmSource.clip = clip;
            this.bgmSource.loop = loop;
            this.bgmSource.volume = this._muted ? 0 : this._bgmVolume;
            this.bgmSource.play();
        });
    }

    public stopBGM(): void {
        this.bgmSource.stop();
    }

    // ── SFX ──

    public playSFX(clipPath: string): void {
        this._loadClip(clipPath, (clip) => {
            this.sfxSource.playOneShot(clip, this._muted ? 0 : this._sfxVolume);
        });
    }

    // ── 从 Bundle 加载音频（优先 audio bundle，回退 resources）──

    private _loadClip(clipPath: string, callback: (clip: AudioClip) => void): void {
        const audioBundle = assetManager.getBundle('audio');
        if (audioBundle) {
            audioBundle.load(clipPath, AudioClip, (err, clip) => {
                if (err) {
                    console.warn(`[AudioManager] Bundle load failed, fallback to resources: ${clipPath}`);
                    this._loadFromResources(clipPath, callback);
                    return;
                }
                callback(clip!);
            });
        } else {
            this._loadFromResources(clipPath, callback);
        }
    }

    private _loadFromResources(clipPath: string, callback: (clip: AudioClip) => void): void {
        resources.load(clipPath, AudioClip, (err, clip) => {
            if (err) {
                console.error(`[AudioManager] Failed to load: ${clipPath}`, err);
                return;
            }
            callback(clip!);
        });
    }

    // ── 音量控制 ──

    public setBGMVolume(vol: number): void {
        this._bgmVolume = vol;
        if (!this._muted) {
            this.bgmSource.volume = vol;
        }
    }

    public setSFXVolume(vol: number): void {
        this._sfxVolume = vol;
    }

    public setMuted(muted: boolean): void {
        this._muted = muted;
        this.bgmSource.volume = muted ? 0 : this._bgmVolume;
    }

    public get isMuted(): boolean {
        return this._muted;
    }

    // ── 前后台 ──

    private _onHide(): void {
        this.bgmSource.pause();
    }

    private _onShow(): void {
        if (!this._muted) {
            this.bgmSource.play();
        }
    }
}