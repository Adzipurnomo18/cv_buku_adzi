const bookElement = document.getElementById("portfolioBook");
const pages = document.querySelectorAll(".page");
const prevButton = document.getElementById("prevPage");
const nextButton = document.getElementById("nextPage");
const pageStatus = document.getElementById("pageStatus");

let pageFlip;
let startPageIndex = 0;

function getBookSize() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const controlsSpace = viewportWidth <= 760 ? 86 : 96;
  const maxOpenBookWidth = Math.min(1160, viewportWidth * 0.96);
  const maxPageHeight = Math.min(700, viewportHeight - controlsSpace);
  const pageWidthByHeight = maxPageHeight * (540 / 700);
  const pageWidthByScreen = maxOpenBookWidth / 2;
  const pageWidth = Math.floor(Math.max(315, Math.min(540, pageWidthByHeight, pageWidthByScreen)));
  const pageHeight = Math.floor(pageWidth * (700 / 540));

  return { pageWidth, pageHeight };
}

function getStartPage() {
  const requestedPage = Number(new URLSearchParams(window.location.search).get("page"));
  if (!Number.isFinite(requestedPage)) return 0;

  const index = Math.max(0, Math.min(pages.length - 1, requestedPage - 1));
  return index % 2 === 0 ? index : index - 1;
}

function updateControls(pageIndex = 0) {
  const total = pages.length;
  const current = Math.min(pageIndex + 1, total);
  pageStatus.textContent = `${String(current).padStart(2, "0")} / ${total}`;
  prevButton.disabled = pageIndex <= 0;
  nextButton.disabled = pageIndex >= total - 2;
}

function initBook() {
  if (!window.St || !window.St.PageFlip) {
    document.body.classList.add("library-error");
    pageStatus.textContent = "StPageFlip gagal dimuat";
    return;
  }

  startPageIndex = getStartPage();
  const { pageWidth, pageHeight } = getBookSize();

  pageFlip = new St.PageFlip(bookElement, {
    width: pageWidth,
    height: pageHeight,
    startPage: startPageIndex,
    size: "stretch",
    minWidth: 315,
    maxWidth: pageWidth,
    minHeight: 410,
    maxHeight: pageHeight,
    drawShadow: true,
    flippingTime: 900,
    usePortrait: true,
    startZIndex: 20,
    autoSize: true,
    maxShadowOpacity: 0.48,
    showCover: false,
    mobileScrollSupport: false,
    swipeDistance: 24,
    clickEventForward: true
  });

  pageFlip.loadFromHTML(pages);
  window.portfolioPageFlip = pageFlip;
  pageFlip.on("init", event => updateControls(event.data.page));
  pageFlip.on("flip", event => updateControls(event.data));
  pageFlip.on("changeOrientation", () => pageFlip.update());
  updateControls(startPageIndex);
}

prevButton.addEventListener("click", () => pageFlip?.flipPrev());
nextButton.addEventListener("click", () => pageFlip?.flipNext());

window.addEventListener("resize", () => {
  window.clearTimeout(window.__bookResizeTimer);
  window.__bookResizeTimer = window.setTimeout(() => pageFlip?.update(), 160);
});

window.addEventListener("load", initBook);
