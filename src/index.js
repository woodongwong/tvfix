const tvfixHost = 'http://live.tvfix.org';

async function handleRequest(request) {

  const url = new URL(request.url);
  const baseURL = url.href.substring(0, url.href.lastIndexOf('/')) + '/';
  const tvfixBaseURL = tvfixHost + url.pathname.substring(0, url.pathname.lastIndexOf('/')) + '/';

  switch (url.pathname) {
    case '/key1.key':
      return new Response(new Uint8Array([0xa3, 0x29, 0x1e, 0x4, 0x62, 0xb7, 0x38, 0x31, 0x84, 0x0, 0xbe, 0x2a, 0xaa, 0x22, 0x11, 0x11]));
    case '/key2.key':
      return new Response(new Uint8Array([0x20, 0xa0, 0x49, 0x23, 0x41, 0x26, 0x1d, 0xa0, 0xc0, 0x70, 0xb2, 0x39, 0xc6, 0x32, 0x60, 0xa]));
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

    // #EXT-X-MEDIA-SEQUENCE
    const mediaSequence = (results.match(/(\d+)\.[a-zA-Z]+/) ?? [])[1];

    // 转换成数组 & 过滤空元素
    results = results.split("\n").filter(item => item);

    // 删除最后一个错误的item
    if (/^\d+\.[a-zA-Z]+$/.test(results[results.length - 1])) {
      results.pop();
    }

    results = results.map((row) => {
      if (row.charAt(0) !== '#') {

        if (!/^https?:\/\//.test(row)) {
          if (row.substring(row.length - 5) === '.m3u8') {
            row = baseURL + row;
          } else {
            row = tvfixBaseURL + row;
          }
        }

      } else if (mediaSequence !== undefined && row.indexOf('#EXT-X-MEDIA-SEQUENCE:') >= 0) {

        // 修正#EXT-X-MEDIA-SEQUENCE
        row = `#EXT-X-MEDIA-SEQUENCE:${mediaSequence}`;

      }

      return row;
    }).join("\n")
      .replaceAll(/URI="(\w+\.m3u8)"/g, `URI="${baseURL}$1"`)
      // 添加#EXT-X-KEY
      .replace('#EXT-X-VERSION:10', `#EXT-X-VERSION:4\n#EXT-X-KEY:METHOD=AES-128,URI="${url.origin}/key1.key",IV=0X956b48324a484d1b4b064c466c428d25`)
      .replace('#EXT-X-VERSION:11', `#EXT-X-VERSION:4\n#EXT-X-KEY:METHOD=AES-128,URI="${url.origin}/key2.key",IV=0X001c111a021a09010e111d170d050801`);
  }

  return new Response(results, { headers: response.headers });
}

addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request));
});
