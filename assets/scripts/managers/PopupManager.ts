import { _decorator, Component, Node, Prefab, instantiate, director, resources } from 'cc';
import { PopupBaseView } from '../components/ui/PopupBaseView';

const { ccclass } = _decorator;

@ccclass('PopupManager')
export class PopupManager extends Component {

    private static _instance: PopupManager | null = null;
    public static get instance(): PopupManager { return PopupManager._instance!; }

    private _activePopups: Node[] = [];

    protected onLoad(): void {
        if (PopupManager._instance && PopupManager._instance !== this) {
            this.node.destroy();
            return;
        }
        PopupManager._instance = this;
        director.addPersistRootNode(this.node);
    }

    protected onDestroy(): void {
        if (PopupManager._instance === this) PopupManager._instance = null;
    }

    public async show(prefab: Prefab, config: any): Promise<Node> {
        const node = instantiate(prefab);
        const canvas = director.getScene()?.getChildByName('Canvas');
        if (canvas) {
            node.parent = canvas;
        }
        const view = node.getComponent(PopupBaseView);
        if (view) {
            view.init(config);
            view.show();
        }
        this._activePopups.push(node);
        return node;
    }

    public close(node: Node): void {
        const view = node.getComponent(PopupBaseView);
        if (view) {
            view.hide();
        } else {
            node.destroy();
        }
        const idx = this._activePopups.indexOf(node);
        if (idx >= 0) this._activePopups.splice(idx, 1);
    }

    public closeAll(): void {
        for (const node of this._activePopups) {
            if (node.isValid) node.destroy();
        }
        this._activePopups = [];
    }
}
