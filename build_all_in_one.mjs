import { readFile, writeFile } from 'node:fs/promises';

const sourceDir = new URL('./パターンB展開/', import.meta.url);
const pages = [
  ['index.html', 'ホーム'],
  ['akiya.html', '空き家再生'],
  ['works.html', '再生実績'],
  ['kaitori.html', '買取物件'],
  ['flow.html', 'ご相談の流れ'],
];

const encodedPages = Object.fromEntries(await Promise.all(pages.map(async ([file]) => [
  file,
  Buffer.from(await readFile(new URL(file, sourceDir))).toString('base64'),
])));

const output = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>イル不動産株式会社</title>
  <style>
    html,body{margin:0;height:100%;background:#fff;font-family:system-ui,sans-serif}iframe{display:block;width:100%;height:100%;border:0}
  </style>
</head>
<body>
  <iframe id="page" title="イル不動産株式会社のページ"></iframe>
  <script>
    const pages = ${JSON.stringify(encodedPages)};
    const frame = document.querySelector('#page');
    const decode = value => new TextDecoder().decode(Uint8Array.from(atob(value), char => char.charCodeAt(0)));
    function showPage(file, hash = '') {
      const actualFile = pages[file] ? file : 'index.html';
      frame.srcdoc = decode(pages[actualFile]);
      history.replaceState(null, '', '#' + actualFile + hash);
    }
    frame.addEventListener('load', () => {
      const doc = frame.contentDocument;
      if (!doc) return;
      const fragment = location.hash.match(/\\.html(#.+)$/)?.[1];
      if (fragment) doc.getElementById(fragment.slice(1))?.scrollIntoView();
      doc.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', event => {
        const href = link.getAttribute('href');
        const match = href && href.match(/^(index|akiya|works|kaitori|flow)\\.html(#.*)?$/);
        if (match) { event.preventDefault(); showPage(match[1] + '.html', match[2] || ''); }
      }));
    });
    const route = location.hash.slice(1).match(/^(index|akiya|works|kaitori|flow)\\.html(#.*)?$/);
    showPage(route ? route[1] + '.html' : 'index.html', route?.[2] || '');
  </script>
</body>
</html>`;

await writeFile(new URL('./イル不動産_統合版.html', import.meta.url), output);
