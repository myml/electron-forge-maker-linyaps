# electron-forge-maker-linyaps

用于将 electron 发布为玲珑包

## 安装

```
yarn add electron-forge-maker-linyaps
```

## 打包配置

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

- id

应用 ID，默认使用 package.json 中的 name，玲珑对 id 有要求，必须为 org.deepin.demo 格式，如不符合通过 config 修改

- version

应用版本，默认使用 package.json 中的 version(三位数字格式的版本自动补充为四位数字)，玲珑对版本号有要求，必须为 x.x.x.x 格式，如不符合通过 config 修改

- name

应用名，默认使用 package.json 中的 productName

- description

应用介绍。默认使用 package.json 中的 description

- command

默认使用 eletron appName

- build

默认为`cp -vr ${dir} $PREFIX/bin`，dir 目录为 eletron 编译后的目录

- buildExt

用于给 build 追加自定义命令，避免覆盖默认 build

- format

打包格式，可选 layer 和 uab，默认导出 layer

- iconFile

指定图标文件，如果未指定，则自动生成图标文件

- desktopFile

指定 desktop 文件，如果未指定，则自动生成 desktop 文件