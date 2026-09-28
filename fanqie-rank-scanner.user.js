// ==UserScript==
// @name         番茄榜单扫描器 Fanqie Rank Scanner
// @namespace    https://github.com/121212165
// @version      0.1.0
// @description  在番茄小说榜单页(/rank/*)一键提取本页书籍(排名/书名/作者/在读/状态/更新时间/简介)，导出 Markdown 素材卡（适配 Story Ledger / scan-card-box frontmatter）或 JSON。纯本地，不登录不上传。
// @author       121212165
// @match        https://fanqienovel.com/rank*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const panel = document.createElement("div");
  panel.style.cssText = [
    "position:fixed", "right:16px", "top:80px", "z-index:99999",
    "background:#fff", "border:1px solid #ddd", "border-radius:10px",
    "box-shadow:0 4px 16px rgba(0,0,0,.15)", "padding:10px", "width:210px",
    "font:13px/1.5 system-ui,-apple-system,'Microsoft YaHei'", "color:#333",
  ].join(";");
  panel.innerHTML = `
    <div style="font-weight:700;margin-bottom:6px">📋 榜单扫描器</div>
    <div id="frs-status" style="color:#888;margin-bottom:6px">就绪</div>
    <button id="frs-scan" style="width:100%;margin-bottom:5px;padding:6px;border:0;border-radius:6px;background:#1f6feb;color:#fff;cursor:pointer">扫描本页（20本）</button>
    <button id="frs-copy" style="width:100%;margin-bottom:5px;padding:6px;border:1px solid #ccc;border-radius:6px;background:#fafafa;cursor:pointer">复制素材卡 Markdown</button>
    <button id="frs-json" style="width:100%;margin-bottom:5px;padding:6px;border:1px solid #ccc;border-radius:6px;background:#fafafa;cursor:pointer">下载 JSON</button>
    <div style="color:#aaa;font-size:11px">导出的 md 可直接拖入 Obsidian<br>素材卡盒（scan-card-box 抽卡可用）</div>`;
  document.body.appendChild(panel);

  const setStatus = (t) => { document.getElementById("frs-status").textContent = t; };
  let lastItems = [];

  // 素材卡 frontmatter：genre=榜单名, hook=简介首句, logline=简介前120字
  function extract() {
    const category = (document.querySelector("h1") || {}).textContent || document.title;
    const items = [...document.querySelectorAll(".rank-book-item")];
    return items.map((el, i) => {
      const idxEl = el.querySelector(".book-item-index");
      const titleA = el.querySelector('a[href^="/page/"]');
      const authorA = el.querySelector('a[href^="/author-page/"]');
      const abstract = (el.querySelector(".desc.abstract") || {}).textContent || "";
      const status = (el.querySelector(".book-item-footer-status") || {}).textContent || "";
      const readers = (el.querySelector(".book-item-count") || {}).textContent || "";
      const last = (el.querySelector(".book-item-footer-last") || {}).textContent || "";
      const time = (el.querySelector(".book-item-footer-time") || {}).textContent || "";
      return {
        rank: parseInt((idxEl || {}).textContent || String(i + 1)) || i + 1,
        title: (titleA || {}).textContent?.trim() || "",
        bookUrl: titleA ? "https://fanqienovel.com" + titleA.getAttribute("href") : "",
        author: (authorA || {}).textContent?.trim() || "",
        readers: readers.replace("在读：", "").trim(),
        status: status.trim(),
        lastChapter: last.replace("最近更新：", "").trim(),
        updateTime: time.trim(),
        category: category.trim(),
        abstract: abstract.trim().slice(0, 300),
      };
    }).filter((x) => x.title);
  }

  function toCardsMd(items) {
    return items.map((b) => [
      "---",
      "tags: [素材卡, 扫榜]",
      `genre: ${b.category}`,
      `hook: ${b.abstract.replace(/\n/g, " ").slice(0, 60)}`,
      `ending: ""`,
      `source: 番茄${b.category}#${b.rank} 在读${b.readers}`,
      "---",
      "",
      `## 《${b.title}》 ${b.author}`,
      `- 状态：${b.status} ｜ 在读：${b.readers} ｜ 更新：${b.updateTime}`,
      `- 链接：${b.bookUrl}`,
      `- 最新：${b.lastChapter}`,
      "",
      b.abstract,
      "",
    ].join("\n")).join("\n\n");
  }

  document.getElementById("frs-scan").onclick = () => {
    lastItems = extract();
    setStatus(lastItems.length ? `已提取 ${lastItems.length} 本` : "未找到书籍（翻页后重扫）");
  };
  document.getElementById("frs-copy").onclick = async () => {
    if (!lastItems.length) lastItems = extract();
    if (!lastItems.length) return setStatus("无可导出内容");
    try {
      await navigator.clipboard.writeText(toCardsMd(lastItems));
      setStatus(`已复制 ${lastItems.length} 张素材卡，去 Obsidian 粘贴即可`);
    } catch (e) { setStatus("复制失败：" + e.message); }
  };
  document.getElementById("frs-json").onclick = () => {
    if (!lastItems.length) lastItems = extract();
    if (!lastItems.length) return setStatus("无可导出内容");
    const blob = new Blob([JSON.stringify(lastItems, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fanqie-rank-${Date.now()}.json`;
    a.click();
    setStatus("JSON 已下载");
  };
})();
