import { SaveLoadRouter } from "../di/Router";
import { IAkiProfile, Info } from "../models/eft/profile/IAkiProfile";
import { ILogger } from "../models/spt/utils/ILogger";
import { LocalisationService } from "../services/LocalisationService";
import { HashUtil } from "../utils/HashUtil";
import { JsonUtil } from "../utils/JsonUtil";
import { VFS } from "../utils/VFS";
export declare class SaveServer {
    protected vfs: VFS;
    protected saveLoadRouters: SaveLoadRouter[];
    protected jsonUtil: JsonUtil;
    protected hashUtil: HashUtil;
    protected localisationService: LocalisationService;
    protected logger: ILogger;
    protected profileFilepath: string;
    protected profiles: {};
    protected onBeforeSaveCallbacks: {};
    protected saveMd5: {};
    constructor(vfs: VFS, saveLoadRouters: SaveLoadRouter[], jsonUtil: JsonUtil, hashUtil: HashUtil, localisationService: LocalisationService, logger: ILogger);
    load(): void;
    save(): void;
    getProfile(sessionId: string): IAkiProfile;
    getProfiles(): Record<string, IAkiProfile>;
    deleteProfileById(sessionID: string): boolean;
    createProfile(profileInfo: Info): void;
    addProfile(profileDetails: IAkiProfile): void;
    loadProfile(sessionID: string): void;
    saveProfile(sessionID: string): void;
    removeProfile(sessionID: string): boolean;
    addBeforeSaveCallback(id: string, callback: (profile: Partial<IAkiProfile>) => Partial<IAkiProfile>): void
    removeBeforeSaveCallback(id: string): void
}
