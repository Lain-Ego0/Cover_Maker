# Cover_Maker

一个本地视频封面制作工具（Web 端操作，体验参考可画）。

## 项目定位
Cover_Maker 面向创作者和运营同学，目标是：
- 本地运行、离线可用
- 上手快，3 分钟完成第一张封面
- 模板化 + 自由编辑并存

## 已实现能力
- 画布与元素：文本、图片、矩形、圆形、层级调整
- 模板系统：内置模板、模板 JSON 导入导出
- 图层面板：选中、上下移动、显隐、锁定
- 字体系统：分类筛选、关键词搜索、收藏、最近使用、离线字体打包
- 编辑体验：吸附对齐线、撤销/重做、自动保存
- 导出能力：PNG 导出（1x/2x/3x）
- 视图导航：
  - 画布自动适配（1K/2K/4K 屏幕）
  - 手动缩放（25% - 400%）
  - `Ctrl/Cmd + 滚轮` 缩放
  - 按住鼠标中键拖动画布视图（平移）

## 环境要求
- Node.js 20+
- npm 10+
- 建议浏览器：Chrome / Edge 最新版

## 快速启动
在仓库根目录执行：

```bash
./aa
```

脚本会自动进入 `web/` 并启动开发服务器。

## 手动启动

```bash
cd web
npm install
npm run dev
```

浏览器访问终端输出的本地地址（默认通常是 `http://localhost:5173`）。

## 新手教程（从 0 到导出）
1. 启动项目后，先在「预设尺寸」选择画布（如 `1920x1080`）。
2. 点击「添加文本」，双击文本进入编辑模式。
3. 在右侧「文字与图层」中选择字体、字号、字色。
4. 点击「上传图片」导入本地素材，拖拽调整位置与大小。
5. 使用左侧「模板」快速套用样式，或导入已有模板 JSON。
6. 使用图层面板管理元素顺序、锁定与显隐。
7. 需要精细对齐时，打开「吸附对齐」。
8. 通过工具栏「画布缩放」或 `Ctrl/Cmd + 滚轮` 调整视图。
9. 大画布移动视区时，按住鼠标中键拖动即可平移。
10. 点击「导出 PNG」，按需求选择倍率（1x/2x/3x）。

## 常用操作速查
- `Delete`：删除当前选中元素
- `Ctrl/Cmd + Z`：撤销
- `Ctrl/Cmd + Y`：重做
- `Ctrl/Cmd + 滚轮`：缩放画布视图
- 鼠标中键拖拽：平移画布视区

## 模板与字体说明
- 模板格式：`cover-maker-template-v1`（JSON）
- 字体来源与许可：见 [`docs/fonts/SOURCES.md`](docs/fonts/SOURCES.md)
- 本地字体文件位于：`web/src/assets/local-fonts/`

## 本地数据与草稿
应用会在浏览器 `localStorage` 中存储：
- 草稿内容（画布状态）
- 字体收藏和最近使用记录

清理浏览器站点数据会导致这些本地数据被清除，请注意备份模板 JSON。

## 构建与预览

```bash
cd web
npm run build
npm run preview
```

## 项目结构

```text
Cover_Maker/
├── aa
├── README.md
├── docs/
│   ├── ROADMAP.md
│   └── fonts/
│       ├── SOURCES.md
│       └── licenses/
└── web/
    ├── src/
    │   ├── App.tsx
    │   ├── App.css
    │   ├── main.tsx
    │   └── assets/
    ├── package.json
    └── vite.config.ts
```

## 常见问题
- 字体没有显示：确认字体已在 `main.tsx` 导入并在字体库中声明。
- 导出图片模糊：提高导出倍率到 `2x` 或 `3x`。
- 画布看不全：点击「适配」重置视图，或使用中键拖动平移。
- 构建体积告警：当前 Fabric 主包较大，属于已知优化项。

## 文档
- 长期规划：[`docs/ROADMAP.md`](docs/ROADMAP.md)
- 字体来源与许可：[`docs/fonts/SOURCES.md`](docs/fonts/SOURCES.md)
