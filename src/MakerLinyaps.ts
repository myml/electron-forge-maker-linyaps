import MakerBase, { MakerOptions } from "@electron-forge/maker-base";
import {
  ForgePlatform,
  IForgeResolvableMaker,
} from "@electron-forge/shared-types";
import path from "path";
import {
  mkdirSync,
  existsSync,
  unlinkSync,
  writeFileSync,
  readdirSync,
} from "fs";
import { exec } from "child_process";
import yaml from "js-yaml";

interface LinyapsProjectConfig {
  version: string;
  package: {
    id: string;
    name: string;
    kind: string;
    version: string;
    description: string;
  };
  base: string;
  command: string[];
  build: string;
}

interface LinyapsForgeConfig {
  id?: string;
  version?: string;
  name?: string;
  description?: string;
  base?: string;
  command?: string[];
  build?: string;
  buildExt?: string;
}
export default class MakerLinyaps extends MakerBase<LinyapsForgeConfig> {
  name = "linglong";
  packageName = "electron-forge-maker-linyaps";
  defaultPlatforms: ForgePlatform[] = ["linux"];

  isSupportedOnCurrentPlatform() {
    return process.platform === "linux";
  }

  async make({
    dir, // '/home/build/Software/monorepo/packages/electron/out/name-linux-x64'
    appName, // 'name'
    makeDir, // '/home/build/Software/monorepo/packages/electron/out/make',
    targetArch, // 'x64'
    packageJSON, // package.json
    targetPlatform, //'linux',
    forgeConfig,
  }: MakerOptions) {
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
      writeFileSync("config.json", config);
    }
    // 创建目录
    if (!existsSync(makeDir)) {
      mkdirSync(makeDir, { recursive: true });
    }
    // 转换类型
    const packageConfig = packageJSON as {
      name: string;
      version: string;
      main: string;
      description: string;
      author: string;
      license: string;
    };

    // 获取maker的配置
    let config: LinyapsForgeConfig = {};
    const maker = forgeConfig.makers.find((maker) => {
      return "name" in maker && maker.name === this.packageName;
    });
    if (maker && "config" in maker) {
      config = maker.config as LinyapsForgeConfig;
    }

    // 生成linglong.yaml
    const dirObj = path.parse(dir);
    let project: LinyapsProjectConfig = {
      version: "1.0",
      package: {
        id: packageConfig.name,
        name: appName,
        kind: "app",
        version: packageConfig.version,
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
    writeFileSync(dirObj.dir + "/linglong.yaml", yaml.dump(project), "utf8");

    // 执行编译
    const buildLogfile = dirObj.dir + "/ll_build.log";
    if (existsSync(buildLogfile)) {
      unlinkSync(buildLogfile);
    }
    await myExec("ll-builder build", {
      cwd: dirObj.dir,
      logfile: buildLogfile,
    });
    // 执行导出
    readdirSync(dirObj.dir).forEach((file) => {
      // 删除有layer后缀的文件
      if (file.endsWith(".layer")) {
        unlinkSync(path.join(dirObj.dir, file));
      }
    });
    const exportLogfile = dirObj.dir + "/ll_export.log";
    if (existsSync(exportLogfile)) {
      unlinkSync(exportLogfile);
    }
    await myExec("ll-builder export --layer", {
      cwd: dirObj.dir,
      logfile: exportLogfile,
    });
    return readdirSync(dirObj.dir)
      .filter((file) => {
        return file.endsWith(".layer") && file.startsWith(project.package.id);
      })
      .map((file) => {
        return path.join(dirObj.dir, file);
      });
  }
}

function myExec(command: string, options: { cwd: string; logfile: string }) {
  return new Promise((resolve, reject) => {
    const cmd = exec(command, options);
    cmd.stdout?.on("data", (data: string) => {
      writeFileSync(options.logfile, data, { flag: "a" });
    });
    cmd.stderr?.on("data", (data: string) => {
      writeFileSync(options.logfile, data, { flag: "a" });
    });
    cmd.on("close", (code: number) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve(code);
      }
    });
  });
}
