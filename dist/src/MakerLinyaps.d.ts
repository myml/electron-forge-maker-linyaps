import MakerBase, { MakerOptions } from "@electron-forge/maker-base";
import { ForgePlatform } from "@electron-forge/shared-types";
interface LinyapsForgeConfig {
    id?: string;
    version?: string;
    name?: string;
    description?: string;
    base?: string;
    command?: string[];
    build?: string;
    buildExt?: string;
    format?: "layer" | "uab";
}
export default class MakerLinyaps extends MakerBase<LinyapsForgeConfig> {
    name: string;
    packageName: string;
    defaultPlatforms: ForgePlatform[];
    isSupportedOnCurrentPlatform(): boolean;
    make({ dir, // '$project/out/name-linux-x64'
    appName, // 'name'
    makeDir, // '$project/out/make',
    targetArch, // 'x64'
    packageJSON, // package.json
    targetPlatform, //'linux',
    forgeConfig, }: MakerOptions): Promise<string[]>;
}
export {};
