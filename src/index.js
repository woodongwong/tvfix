const tvfixHost = 'http://live.tvfix.org';

async function handleRequest(request) {

  const url = new URL(request.url);
  const baseURL = url.href.substring(0, url.href.lastIndexOf('/')) + '/';
  const tvfixBaseURL = tvfixHost + url.pathname.substring(0, url.pathname.lastIndexOf('/')) + '/';

  switch (url.pathname) {
    case '/key1.key':
      return new Response(new Uint8Array([0x52, 0x1a, 0xe5, 0x78, 0x04, 0xca, 0xd5, 0x49, 0xab, 0x1a, 0xad, 0x80, 0x81, 0x5c, 0x71, 0x01]));
    case '/key2.key':
      return new Response(new Uint8Array([0xb1, 0x01, 0x91, 0xa0, 0xe1, 0x6c, 0xa8, 0x7a, 0x91, 0x26, 0xc6, 0x14, 0xca, 0xab, 0x04, 0xfc]));
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
      .replace('#EXT-X-VERSION:10', `#EXT-X-VERSION:10\n#EXT-X-KEY:METHOD=AES-128,URI="${url.origin}/key1.key",IV=0X984102d7100a2f0e39c6bb55ec19c530`)
      .replace('#EXT-X-VERSION:11', `#EXT-X-VERSION:11\n#EXT-X-KEY:METHOD=AES-128,URI="${url.origin}/key2.key",IV=0X67e2e7bdf511af11355293d43fedf83f`);
  }

  return new Response(results, {headers: response.headers});
}

addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request));
});
