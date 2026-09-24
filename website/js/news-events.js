/* ============================================================
   Lions CMS — News & Events page
   ============================================================
   Fetches published News + Events from the CMS's public,
   read-only API (no auth required, only PUBLISHED items are
   ever returned) and renders them into the existing
   .news-card markup so all current styling/animation keeps
   working unchanged. Paginates client-side, 9 cards per page,
   same as the page's original static behaviour.
*/
(function () {
  "use strict";

  var API_BASE = window.LIONS_CMS_API_BASE || "http://localhost:4000/api";
  var CARDS_PER_PAGE = 9;

  var grid = document.getElementById("newsEventsGrid");
  var paginationEl = document.getElementById("newsPagination");
  var statusEl = document.getElementById("newsEventsStatus");

  if (!grid) return;

  var items = [];
  var currentPage = 1;

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function stripHtml(html) {
    var div = document.createElement("div");
    div.innerHTML = html || "";
    return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
  }

  function truncate(text, max) {
    if (!text) return "";
    if (text.length <= max) return text;
    return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  function pickImage(mediaList) {
    if (!Array.isArray(mediaList) || mediaList.length === 0) return null;
    var image = mediaList.filter(function (m) { return m.mediaType === "IMAGE"; })[0];
    if (image) return { src: image.url, alt: image.altText || "" };
    var video = mediaList.filter(function (m) { return m.mediaType === "VIDEO" && m.thumbnailUrl; })[0];
    if (video) return { src: video.thumbnailUrl, alt: video.altText || "" };
    return null;
  }

  function fetchJson(url) {
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed: " + res.status);
        return res.json();
      })
      .then(function (body) {
        if (!body.success) throw new Error((body.error && body.error.message) || "Request failed");
        return body.data;
      });
  }

  function loadContent() {
    Promise.all([
      fetchJson(API_BASE + "/public/news?page=1&pageSize=60"),
      fetchJson(API_BASE + "/public/events?page=1&pageSize=60&upcomingOnly=false")
    ])
      .then(function (results) {
        var newsItems = results[0];
        var eventItems = results[1];

        var normalizedNews = newsItems.map(function (n) {
          return {
            type: "NEWS",
            title: n.title,
            description: n.summary ? n.summary : truncate(stripHtml(n.content), 140),
            date: n.publishedAt || n.createdAt,
            image: pickImage(n.media)
          };
        });

        var normalizedEvents = eventItems.map(function (e) {
          return {
            type: "EVENT",
            title: e.title,
            description: truncate(stripHtml(e.description), 140),
            date: e.eventDate,
            image: pickImage(e.media)
          };
        });

        items = normalizedNews.concat(normalizedEvents).sort(function (a, b) {
          return new Date(b.date) - new Date(a.date);
        });

        if (items.length === 0) {
          grid.innerHTML = "";
          if (paginationEl) paginationEl.innerHTML = "";
          if (statusEl) statusEl.textContent = "No news or events have been published yet. Please check back soon.";
          return;
        }

        if (statusEl) statusEl.textContent = "";
        renderPage(1);
      })
      .catch(function (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load News & Events from the CMS:", err);
        if (statusEl) {
          statusEl.textContent =
            "We couldn't load the latest news & events right now. Please try again shortly, or contact the college office.";
        }
      });
  }

  function cardHtml(item) {
    var badge = item.type === "EVENT" ? "Event" : "News";
    var dateLabel = formatDate(item.date);
    var imageBlock = item.image
      ? '<img src="' + escapeHtml(item.image.src) + '" alt="' + escapeHtml(item.image.alt || item.title) + '" class="news-img">'
      : '<div class="news-img news-img-fallback"><i class="fa ' +
        (item.type === "EVENT" ? "fa-calendar-days" : "fa-newspaper") +
        '"></i></div>';

    var metaHtml = '<div class="news-meta">' +
      (dateLabel ? '<span class="news-date-badge">' + escapeHtml(dateLabel) + '</span>' : '') +
      '<span class="news-type-badge news-type-badge--' + item.type.toLowerCase() + '">' + badge + '</span>' +
      '</div>';

    return (
      '<div class="col-md-6 col-lg-4">' +
        '<div class="news-card">' +
          '<div class="news-img-wrap">' +
            imageBlock +
          '</div>' +
          '<div class="news-body">' +
            metaHtml +
            '<h5>' + escapeHtml(item.title) + '</h5>' +
            '<p>' + escapeHtml(item.description) + '</p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderPage(page) {
    var totalPages = Math.max(1, Math.ceil(items.length / CARDS_PER_PAGE));
    currentPage = Math.min(Math.max(1, page), totalPages);

    var start = (currentPage - 1) * CARDS_PER_PAGE;
    var pageItems = items.slice(start, start + CARDS_PER_PAGE);

    grid.innerHTML = pageItems.map(cardHtml).join("");
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (!paginationEl) return;
    if (totalPages <= 1) {
      paginationEl.innerHTML = "";
      return;
    }

    var html = '<button class="news-page-prev" type="button" aria-label="Previous page"' +
      (currentPage === 1 ? " disabled" : "") + '><i class="fa fa-arrow-left"></i></button>';

    for (var p = 1; p <= totalPages; p++) {
      html += '<button class="news-page-btn' + (p === currentPage ? " active" : "") +
        '" type="button" data-page="' + p + '" aria-label="Page ' + p + '">' + p + "</button>";
    }

    html += '<button class="news-page-next" type="button" aria-label="Next page"' +
      (currentPage === totalPages ? " disabled" : "") + '><i class="fa fa-arrow-right"></i></button>';

    paginationEl.innerHTML = html;

    var prevBtn = paginationEl.querySelector(".news-page-prev");
    var nextBtn = paginationEl.querySelector(".news-page-next");
    if (prevBtn) prevBtn.addEventListener("click", function () { goToPage(currentPage - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goToPage(currentPage + 1); });

    var pageButtons = paginationEl.querySelectorAll(".news-page-btn");
    for (var i = 0; i < pageButtons.length; i++) {
      pageButtons[i].addEventListener("click", function () {
        goToPage(Number(this.getAttribute("data-page")));
      });
    }
  }

  function goToPage(page) {
    renderPage(page);
    var nav = document.querySelector(".main-navbar");
    var section = grid.closest("section");
    var navHeight = nav ? nav.getBoundingClientRect().height : 0;
    if (section) {
      var top = section.getBoundingClientRect().top + window.scrollY - navHeight - 20;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }

  document.addEventListener("DOMContentLoaded", loadContent);
})();
