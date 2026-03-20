# 字体来源与许可说明

本项目当前新增字体来源如下：

## 1. Velvetyne
- 站点：`https://velvetyne.fr/`
- 本次接入字体：
  - Avara
  - Compagnon
  - Outward Round
- 下载入口（来自 Velvetyne 下载页内的公开仓库链接）：
  - `https://gitlab.com/velvetyne/Avara/-/archive/master/Avara-master.zip`
  - `https://gitlab.com/velvetyne/compagnon/-/archive/master/compagnon-master.zip`
  - `https://github.com/raoulaudouin/Outward/archive/master.zip`
- 已保存许可证/版权说明：
  - `docs/fonts/licenses/Avara-README.md`
  - `docs/fonts/licenses/Compagnon-LICENSE.txt`
  - `docs/fonts/licenses/Compagnon-COPYRIGHT.md`
  - `docs/fonts/licenses/Outward-LICENSE.txt`
  - `docs/fonts/licenses/Outward-README.md`

## 2. Google Fonts
- 站点：`https://fonts.google.com/`
- 通过 `@fontsource/*` 包接入（离线打包）：
  - Abril Fatface
  - Bebas Neue
  - Anton
  - Caveat
  - Allura
  - Sacramento
  - Kaushan Script
  - Satisfy
  - Permanent Marker
  - Playfair Display
  - Bangers
  - Righteous

## 3. Font Squirrel
- 站点：`https://www.fontsquirrel.com/`
- 说明：当前执行环境访问该站点时触发 WAF challenge（HTTP 202 + `x-amzn-waf-action: challenge`），无法自动抓取字体文件。
- 后续可选方案：
  - 你手动下载后放入 `web/src/assets/local-fonts/`，我来接入。
  - 或等待网络环境可访问后再自动拉取。

## 4. 使用约束
- 商用前请按各字体原许可条款执行（署名、再分发、修改等）。
- 本文件仅记录来源与工程接入信息，不替代具体许可证文本。
