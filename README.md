# 番茄榜单扫描器（油猴脚本）

在番茄小说网页版榜单页（`fanqienovel.com/rank/*`）右上加浮动面板，一键提取本页
20 本书的：排名、书名、作者、链接、在读数、连载状态、最新章节、更新时间、简介。

纯本地运行：不登录、不上传、只读页面已有数据（选择器基于 2026-09 实测 SSR 结构）。

## 安装

1. 浏览器装 [Tampermonkey](https://www.tampermonkey.net/) 扩展
2. Tampermonkey 管理面板 → 新建脚本 → 粘贴 `fanqie-rank-scanner.user.js` 全文 → 保存
3. 打开任意榜单页（如 女频阅读榜·古风世情 `/rank/0_2_1139`），右上角出现「📋 榜单扫描器」面板

## 用法

1. **扫描本页** —— 提取当前榜单页书籍；翻页/换榜后重扫一次
2. **复制素材卡 Markdown** —— 每本书一张素材卡（frontmatter: genre=榜单名、
   hook=简介首句、source=番茄榜#排名+在读数），去 Obsidian `素材卡盒/` 粘贴即成卡片，
   scan-card-box 的抽卡组合立即可用
3. **下载 JSON** —— 原始结构化数据，供后续批量分析

## 与现有工具链的衔接

```
番茄榜单页 --本脚本--> 素材卡.md --粘贴--> Obsidian 素材卡盒
       --scan-card-box 抽卡组合--> 立项笔记
       --daoyu-studio 书名/导语 --> 正文 --AI味红绿灯/QS-8 --> fanqie-drafter 传草稿
```

补齐四层降级链路的第一层（站内扫榜），与 B 站扫榜 MVP（bili-scanner-mvp）平行。
