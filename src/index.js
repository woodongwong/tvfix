const tvfixHost = 'http://live.tvfix.org';

async function handleRequest(request) {

  const url = new URL(request.url);
  const baseURL = url.href.substring(0, url.href.lastIndexOf('/')) + '/';
  const tvfixBaseURL = tvfixHost + url.pathname.substring(0, url.pathname.lastIndexOf('/')) + '/';

  switch (url.pathname) {
    case '/key1.key':
      return new Response(new Uint8Array([0xef, 0x29, 0x1e, 0x84, 0x62, 0xff, 0x7d, 0x71, 0x84, 0xc4, 0xbf, 0x2e, 0xeb, 0x27, 0x15, 0x59]));
    case '/key2.key':
      return new Response(new Uint8Array([0xa0, 0xed, 0x49, 0xa3, 0x4d, 0x26, 0x1d, 0xa9, 0xc1, 0x70, 0xb3, 0xfd, 0xc6, 0x32, 0xe4, 0xa]));
  }

  const init = {
    headers: {
      'Referer': tvfixHost,
      'User-Agent': request.headers.get('user-agent')
    }
  };

  const response = await fetch(tvfixHost + url.pathname, init);
  let results = await response.text();

  // 处理加密视频 & URI
  if (url.pathname.split('.').pop() === 'm3u8') {
    results = results.split("\n").map(row => {
      if (row) {
        if (row.charAt(0) !== '#') {
          if (!/^https?:\/\//.test(row)) {
            if (row.substring(row.length - 5) === '.m3u8') {
              row = baseURL + row;
            } else {
              row = tvfixBaseURL + row;
            }
          }
        } else if (row.indexOf('TYPE=SUBTITLES,') >= 0) {
          row = row.replaceAll(/URI="(\w+\.m3u8)"/g, `URI="${tvfixBaseURL}$1"`);
        }
      }
      return row;
    }).join("\n")
      .replaceAll(/URI="(\w+\.m3u8)"/g, `URI="${baseURL}$1"`)
      .replace('#EXT-X-VERSION:10', `#EXT-X-VERSION:10\n#EXT-X-KEY:METHOD=AES-128,URI="${url.origin}/key1.key",IV=0X956beb324a48f0beeea94ce96ce58dc8`)
      .replace('#EXT-X-VERSION:11', `#EXT-X-VERSION:11\n#EXT-X-KEY:METHOD=AES-128,URI="${url.origin}/key2.key",IV=0X00bcd19a025a2981aeb17d374da52861`);
  }

  return new Response(results, { headers: response.headers });
}

addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request));
});
