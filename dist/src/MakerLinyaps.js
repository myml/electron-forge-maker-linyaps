"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const maker_base_1 = __importDefault(require("@electron-forge/maker-base"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const js_yaml_1 = __importDefault(require("js-yaml"));
class MakerLinyaps extends maker_base_1.default {
    constructor() {
        super(...arguments);
        this.name = "linyaps";
        this.packageName = "electron-forge-maker-linyaps";
        this.defaultPlatforms = ["linux"];
    }
    isSupportedOnCurrentPlatform() {
        return process.platform === "linux";
    }
    make({ dir, // '$project/out/name-linux-x64'
    appName, // 'name'
    makeDir, // '$project/out/make',
    targetArch, // 'x64'
    packageJSON, // package.json
    targetPlatform, //'linux',
    forgeConfig, // forge.config
     }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (false) {
                // 调试用，将所有参数打印到文件
                const config = JSON.stringify({
                    dir,
                    appName,
                    makeDir,
                    targetArch,
                    packageJSON,
                    targetPlatform,
                    forgeConfig,
                });
                // 写入到文件
                (0, fs_1.writeFileSync)("config.json", config);
            }
            // 创建目录
            if (!(0, fs_1.existsSync)(makeDir)) {
                (0, fs_1.mkdirSync)(makeDir, { recursive: true });
            }
            // 转换类型
            const packageConfig = packageJSON;
            // 获取maker的配置
            let config = {};
            const maker = forgeConfig.makers.find((maker) => {
                return "name" in maker && maker.name === this.packageName;
            });
            if (maker && "config" in maker) {
                config = maker.config;
            }
            let version = packageConfig.version;
            // 如果版本号是三位数字格式，则补充为四位数字格式
            if (/^\d+\.\d+\.\d+$/.test(version)) {
                version += ".0"; // 补充为四位数字格式
            }
            // 如果版本号不是四位数字格式，则抛出错误，提示用户可以在forge.config.js中配置版本号
            if (!/^\d+\.\d+\.\d+\.\d+$/.test(version)) {
                throw new Error(`Invalid version format: ${version}. Expected format is x.x.x.x.\nYou can configure the version in forge.config.js.`);
            }
            // 生成linglong.yaml
            const dirObj = path_1.default.parse(dir);
            let project = {
                version: "1.0",
                package: {
                    id: packageConfig.name,
                    name: appName,
                    kind: "app",
                    version: version,
                    description: packageConfig.description,
                },
                base: "org.deepin.base/23.1.0",
                command: [appName],
                build: `cp -vr ${dirObj.name} $PREFIX/bin`,
            };
            // 合并配置
            if (config.id) {
                project.package.id = config.id;
            }
            if (config.version) {
                project.package.version = config.version;
            }
            if (config.name) {
                project.package.name = config.name;
            }
            if (config.description) {
                project.package.description = config.description;
            }
            if (config.base) {
                project.base = config.base;
            }
            if (config.command) {
                project.command = config.command;
            }
            if (config.build) {
                project.build = config.build;
            }
            if (config.buildExt) {
                project.build = project.build + "\n" + config.buildExt;
            }
            // 保存linglong.yaml到out目录
            (0, fs_1.writeFileSync)(dirObj.dir + "/linglong.yaml", js_yaml_1.default.dump(project), "utf8");
            // 执行编译
            const buildLogfile = dirObj.dir + "/ll_build.log";
            if ((0, fs_1.existsSync)(buildLogfile)) {
                (0, fs_1.unlinkSync)(buildLogfile);
            }
            yield myExec("ll-builder build", {
                cwd: dirObj.dir,
                logfile: buildLogfile,
            });
            // 执行导出
            (0, fs_1.readdirSync)(dirObj.dir).forEach((file) => {
                // 删除有layer后缀的文件
                if (file.endsWith(".layer")) {
                    (0, fs_1.unlinkSync)(path_1.default.join(dirObj.dir, file));
                }
            });
            const exportLogfile = dirObj.dir + "/ll_export.log";
            if ((0, fs_1.existsSync)(exportLogfile)) {
                (0, fs_1.unlinkSync)(exportLogfile);
            }
            let exportArgs = "--layer";
            if (config.format === "uab") {
                exportArgs = "";
            }
            yield myExec(`ll-builder export ${exportArgs}`, {
                cwd: dirObj.dir,
                logfile: exportLogfile,
            });
            return (0, fs_1.readdirSync)(dirObj.dir)
                .filter((file) => {
                return file.endsWith(".layer") && file.startsWith(project.package.id);
            })
                .map((file) => {
                return path_1.default.join(dirObj.dir, file);
            });
        });
    }
}
exports.default = MakerLinyaps;
function myExec(command, options) {
    return new Promise((resolve, reject) => {
        var _a, _b;
        const cmd = (0, child_process_1.exec)(command, options);
        (_a = cmd.stdout) === null || _a === void 0 ? void 0 : _a.on("data", (data) => {
            (0, fs_1.writeFileSync)(options.logfile, data, { flag: "a" });
        });
        (_b = cmd.stderr) === null || _b === void 0 ? void 0 : _b.on("data", (data) => {
            (0, fs_1.writeFileSync)(options.logfile, data, { flag: "a" });
        });
        cmd.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`Command failed with code ${code}`));
            }
            else {
                resolve(code);
            }
        });
    });
}
//# sourceMappingURL=MakerLinyaps.js.map