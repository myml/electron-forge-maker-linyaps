# electron-forge-maker-linyaps

用于将 electron 发布为玲珑包

## Usage

```
yarn add --dev https://github.com/myml/electron-forge-maker-linyaps
```

## example forgeconfig.js

```
makers: [
  {
    name: 'electron-forge-maker-linyaps',
    platforms: ['linux'],
    config: { id: org.deepin.demo, version: 1.0.0.0 },
  },
];

```

config 可选配置项目：

```ts
interface LinyapsForgeConfig {
  id?: string;
  version?: string;
  name?: string;
  description?: string;
  base?: string;
  command?: string[];
  build?: string;
}
```

- id

默认使用 package.json 中的 name，玲珑对 id 有要求，必须为 org.deepin.demo 格式，如不符合通过 config 修改

- version

默认使用 package.json 中的 version，玲珑对版本号有要求，必须为 x.x.x.x 格式，如不符合通过 config 修改

- name

默认使用 package.json 中的 name

- description

默认使用 package.json 中的 description

- command

默认使用 eletron appName

- build

默认为`cp -vr ${dir} $PREFIX/bin`，dir目录为eletron 编译后的目录

- buildExt

用于给 build 追加自定义命令，避免覆盖默认build
