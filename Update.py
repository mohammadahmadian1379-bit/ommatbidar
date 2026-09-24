# -*- coding: utf-8 -*-
"""اسکریپت خودکار «امت بیدار»:
آخرین پست‌های کانال تلگرام @ommatbidar را می‌خواند و news.json سایت را به‌روز می‌کند."""

import re, html, json, io, os, urllib.request

CHANNEL = "ommatbidar"
BASE = "https://t.me/" + CHANNEL
URL = "https://t.me/s/" + CHANNEL
MAX_NEWS = 40

CAT_RULES = [
    ("اقتصادی", ["اقتصاد","دلار","تورم","بورس","طلا","نفت","ارز","بنزین","قیمت","یارانه","بازار"]),
    ("بین‌الملل", ["آمریکا","اسرائیل","فلسطین","غزه","روسیه","اوکراین","چین","ترامپ","عربستان","سوریه","عراق"]),
    ("سیاسی", ["مجلس","دولت","وزیر","رئیس","رییس","سیاست","انتخابات","دیدار","توافق","قطعنامه"]),
    ("ورزشی", ["فوتبال","ورزش","تیم ملی","استقلال","پرسپولیس","والیبال","المپیک"]),
    ("اجتماعی", ["زلزله","سیل","حوادث","سلامت","دانشگاه","دانشجو","آموزش","محیط زیست"]),
]

def fetch():
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8")

def strip_tags(raw):
    raw = re.sub(r"<br\s*/?>", "\n", raw)
    raw = re.sub(r"<[^>]+>", "", raw)
    return html.unescape(raw).strip()

def category_of(text):
    for cat, words in CAT_RULES:
        if any(w in text for w in words):
            return cat
    return "خبر"

def to_jalali(gy, gm, gd):
    gdm = [0,31,59,90,120,151,181,212,243,273,304,334]
    gy2 = gy + 1 if gm > 2 else gy
    days = 355666 + 365*gy + (gy2+3)//4 - (gy2+99)//100 + (gy2+399)//400 + gd + gdm[gm-1]
    jy = -1595 + 33*(days//12053); days %= 12053
    jy += 4*(days//1461); days %= 1461
    if days > 365:
        jy += (days-1)//365; days = (days-1) % 365
    if days < 186:
        jm, jd = 1 + days//31, 1 + days % 31
    else:
        jm, jd = 7 + (days-186)//30, 1 + (days-186) % 30
    return jy, jm, jd

FA = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")

def jdate(dt):
    try:
        jy, jm, jd = to_jalali(int(dt[0:4]), int(dt[5:7]), int(dt[8:10]))
        return ("%d/%02d/%02d" % (jy, jm, jd)).translate(FA)
    except Exception:
        return ""

def parse(page):
    news = []
    for chunk in re.split(r'<div class="tgme_widget_message_wrap', page)[1:]:
        mid = re.search(r'data-post="%s/(\d+)"' % CHANNEL, chunk)
        if not mid:
            continue
        t = re.search(r'<time[^>]*datetime="([^"]+)"', chunk)
        ph = re.search(r"background-image:url\('([^']+)'\)", chunk)
        tx = re.search(r'class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', chunk, re.S)
        text = strip_tags(tx.group(1)) if tx else ""
        title = text.split("\n")[0].strip()[:130] or "خبر از کانال امت بیدار"
        excerpt = " ".join(text.split("\n")[1:]).strip() or title
        news.append({
            "id": int(mid.group(1)),
            "title": title,
            "excerpt": excerpt[:280],
            "category": category_of(title + " " + excerpt),
            "date": jdate(t.group(1)) if t else "",
            "source": "کانال تلگرام امت بیدار",
            "link": "%s/%s" % (BASE, mid.group(1)),
            "image": ph.group(1) if ph else "",
        })
    news.sort(key=lambda n: n["id"], reverse=True)
    return news[:MAX_NEWS]

def main():
    news = parse(fetch())
    data = json.dumps({"news": news}, ensure_ascii=False, indent=2)
    old = ""
    if os.path.exists("news.json"):
        with io.open("news.json", encoding="utf-8") as f:
            old = f.read()
    if data != old:
        with io.open("news.json", "w", encoding="utf-8") as f:
            f.write(data)
        print("updated:", len(news), "news")
    else:
        print("no change")

if __name__ == "__main__":
    main()