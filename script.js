/* ===== امت بیدار — موتور نمایش اخبار =====
   اخبار از فایل news.json خوانده می‌شود.
   اگر فایل در دسترس نباشد، اخبار نمونه نمایش داده می‌شود. */

const SAMPLE_NEWS = [
  {id:1, title:"گزارش ویژه: نقش رسانه‌های مستقل در آگاهی‌بخشی اجتماعی", excerpt:"در سال‌های اخیر مجموعه‌های خبری مستقل نقش پررنگی در انتشار سریع اخبار و شکل‌دهی افکار عمومی داشته‌اند. در این گزارش نگاهی داریم به این تحول.", category:"تحلیل", date:"۱۴۰۵/۰۷/۰۲", source:"تحریریه امت بیدار", link:"https://t.me/ommatbidar", image:""},
  {id:2, title:"نشست خبری سخنگوی دولت فردا برگزار می‌شود", excerpt:"بر اساس اطلاعیه منتشرشده، نشست خبری هفتگی سخنگوی دولت فردا با حضور خبرنگاران رسانه‌های داخلی برگزار خواهد شد.", category:"سیاسی", date:"۱۴۰۵/۰۷/۰۲", source:"کانال تلگرام امت بیدار", link:"https://t.me/ommatbidar", image:""},
  {id:3, title:"طرح جدید حمایت از تولید ملی کلید خورد", excerpt:"معاون صنعتی وزارت صمت از آغاز طرح جدید حمایت از واحدهای تولیدی کوچک خبر داد و جزئیات آن را تشریح کرد.", category:"اقتصادی", date:"۱۴۰۵/۰۷/۰۱", source:"کانال تلگرام امت بیدار", link:"https://t.me/ommatbidar", image:""},
  {id:4, title:"آغاز ثبت‌نام طرح‌های اشتغال‌زایی روستایی", excerpt:"مدیرکل امور روستایی از آغاز ثبت‌نام طرح‌های اشتغال‌زایی در مناطق روستایی سراسر کشور خبر داد.", category:"اجتماعی", date:"۱۴۰۵/۰۷/۰۱", source:"کانال بله امت بیدار", link:"https://ble.ir/ommatbidar", image:""},
  {id:5, title:"نشست خبری مقام‌های منطقه‌ای درباره همکاری‌های اقتصادی", excerpt:"در نشست مشترک مقام‌های چند کشور منطقه بر گسترش همکاری‌های اقتصادی و تجاری تأکید شد.", category:"بین‌الملل", date:"۱۴۰۵/۰۶/۳۱", source:"کانال تلگرام امت بیدار", link:"https://t.me/ommatbidar", image:""},
  {id:6, title:"توصیه‌های حوزه سلامت برای فصل سرد سال", excerpt:"کارشناسان حوزه سلامت با انتشار اطلاعیه‌ای توصیه‌هایی برای پیشگیری از بیماری‌های فصل سرد ارائه کردند.", category:"اجتماعی", date:"۱۴۰۵/۰۶/۳۰", source:"کانال ایتا امت بیدار", link:"https://eitaa.com/ommatbidar", image:""},
  {id:7, title:"رشد بازار سرمایه در هفته گذشته", excerpt:"شاخص کل بورس تهران در پایان معاملات هفته گذشته با رشد مواجه شد؛ جزئیات را در این گزارش بخوانید.", category:"اقتصادی", date:"۱۴۰۵/۰۶/۲۹", source:"کانال تلگرام امت بیدار", link:"https://t.me/ommatbidar", image:""}
];

const CAT_ICONS = {"سیاسی":"🏛️","اجتماعی":"👥","اقتصادی":"📈","بین‌الملل":"🌍","تحلیل":"📝","ورزشی":"⚽","فرهنگی":"🎭"};
let NEWS = [];
let activeCat = "همه";

/* خواندن اخبار */
async function loadNews(){
  try{
    const res = await fetch("news.json", {cache:"no-store"});
    const data = await res.json();
    NEWS = data.news || data;
  }catch(e){
    NEWS = SAMPLE_NEWS;
  }
  render();
}

/* ابزارها */
const esc = s => String(s||"").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function mediaHTML(item, cls){
  const icon = CAT_ICONS[item.category] || "📰";
  return item.image
    ? `<div class="${cls}" style="background:url('${esc(item.image)}') center/cover"></div>`
    : `<div class="${cls}"><span class="ph">${icon}</span></div>`;
}

/* رندر */
function render(){
  renderTicker();
  renderFeatured();
  renderChips();
  renderGrid();
}

function renderTicker(){
  const t = document.getElementById("ticker");
  t.innerHTML = NEWS.slice(0,6).map(n=>`<span>${esc(n.title)}</span>`).join("");
}

function renderFeatured(){
  const f = NEWS[0];
  if(!f) return;
  document.getElementById("featured").innerHTML = `
  <article class="featured">
    ${mediaHTML(f,"f-media")}
    <div class="f-body">
      <span class="f-tag">${esc(f.category)}</span>
      <h1><a href="${esc(f.link||"#")}" target="_blank">${esc(f.title)}</a></h1>
      <p>${esc(f.excerpt)}</p>
      <div class="meta"><span>🗓 ${esc(f.date)}</span><span>منبع: <b>${esc(f.source)}</b></span></div>
    </div>
  </article>`;
}

function renderChips(){
  const cats = ["همه", ...new Set(NEWS.map(n=>n.category))];
  document.getElementById("chips").innerHTML = cats.map(c =>
    `<button class="chip ${c===activeCat?"active":""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  document.querySelectorAll(".chip").forEach(b =>
    b.onclick = () => { activeCat = b.dataset.cat; renderChips(); renderGrid(); });
}

function renderGrid(){
  const q = (document.getElementById("searchBox").value||"").trim();
  const list = NEWS.slice(1).filter(n =>
    (activeCat==="همه" || n.category===activeCat) &&
    (!q || n.title.includes(q) || (n.excerpt||"").includes(q)));
  document.getElementById("emptyMsg").hidden = list.length>0;
  document.getElementById("newsGrid").innerHTML = list.map(n => `
    <article class="card">
      ${mediaHTML(n,"c-media")}
      <div class="c-body">
        <span class="c-tag">${esc(n.category)}</span>
        <h3><a href="${esc(n.link||"#")}" target="_blank">${esc(n.title)}</a></h3>
        <p>${esc(n.excerpt)}</p>
        <div class="meta"><span>🗓 ${esc(n.date)}</span><span>منبع: <b>${esc(n.source)}</b></span></div>
      </div>
    </article>`).join("");
}

/* جستجو */
document.getElementById("searchBox").addEventListener("input", renderGrid);

/* حالت شب و روز */
const themeBtn = document.getElementById("themeBtn");
if(localStorage.getItem("theme")==="dark"){ document.body.dataset.theme="dark"; themeBtn.textContent="☀️"; }
themeBtn.onclick = () => {
  const dark = document.body.dataset.theme==="dark";
  document.body.dataset.theme = dark ? "" : "dark";
  themeBtn.textContent = dark ? "🌙" : "☀️";
  localStorage.setItem("theme", dark ? "light" : "dark");
};

/* بازگشت به بالا */
const toTop = document.getElementById("toTop");
window.addEventListener("scroll", () => toTop.classList.toggle("show", scrollY>500));
toTop.onclick = () => scrollTo({top:0,behavior:"smooth"});

loadNews();