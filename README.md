# tvfix
live.tvfix.org（电视匣、电视侠）直播源

电视匣只能通过浏览器观看，本项目将源进行转换，目的是可以在电视盒子等设备上观看。

代码部署在 cloudflare worker，大家也可以部署到自己的 worker（PS：workers.dev 已墙），或部署在软路由等设备上。

***tvfix.woodong.workers.dev 每日的使用量已经超出了免费额度，希望大家能自己部署***

### 部署

部署到 cloudflare workers 可以参考官方文档：https://developers.cloudflare.com/workers/

#### 本地部署

```bash
# 1. 安装 wrangler
npm install -g wrangler

# 2. clone 代码
git clone --depth=1 https://github.com/woodongwong/tvfix.git
cd tvfix

# 3. 本地运行
wrangler dev --local --ip 0.0.0.0 --port 8000
# 后台运行
nohup wrangler dev --local --ip 0.0.0.0 --port 8000 > /dev/null 2>&1 &
```

关于 wrangler dev 更多使用方法请阅读官方文档：https://developers.cloudflare.com/workers/wrangler/commands/#dev

#### 使用方法

将 [channel.m3u](https://github.com/woodongwong/tvfix/blob/main/channel.m3u) 文件中的域名替换成自己的，如：`http://12.0.0.1:8000/hls/jadehk.m3u8`

### 感谢电视匣
