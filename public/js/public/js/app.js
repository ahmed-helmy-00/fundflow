async function checkAuth() {
  try {
    const response = await fetch("/auth-status");
    const data = await response.json();

    if (data.authenticated) {
      // 1. Hide the Sign In button
      const signInBtn = document.getElementById("signin-btn");
      if (signInBtn) signInBtn.classList.add("hidden");

      // 2. Show the User Display and Role
      const userDisplay = document.getElementById("user-display");
      if (userDisplay) {
        userDisplay.classList.remove("hidden");
        userDisplay.classList.add("flex");
        // Set the text to the role (e.g., DONOR)
        userDisplay.querySelector("span").textContent = data.user.role;
      }
    }
  } catch (err) {
    console.log("User is not authenticated");
  }
}

window.addEventListener("load", checkAuth);

// ---- Page routing ----
function showPage(name) {
  pages.forEach((p) => {
    document.getElementById("page-" + p).classList.remove("active");
    const nav = document.getElementById("nav-" + p);
    if (nav) nav.classList.remove("active");
  });
  document.getElementById("page-" + name).classList.add("active");
  const nav = document.getElementById("nav-" + name);
  if (nav) nav.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  // Close mobile menu
  document.getElementById("mobile-menu").classList.add("hidden");
  lucide.createIcons();
}

function toggleMobileMenu() {
  document.getElementById("mobile-menu").classList.toggle("hidden");
}

// ---- Billing toggle ----
let isAnnual = false;
const prices = {
  starter: [0, 0],
  pro: [29, 23],
  enterprise: ["Custom", "Custom"],
};
function toggleBilling() {
  isAnnual = !isAnnual;
  const knob = document.getElementById("billing-knob");
  knob.style.transform = isAnnual ? "translateX(28px)" : "";
  document.getElementById("label-monthly").className = isAnnual
    ? "text-sm font-medium text-gray-400"
    : "text-sm font-medium text-gray-700";
  document.getElementById("label-annual").className = isAnnual
    ? "text-sm font-medium text-gray-700"
    : "text-sm font-medium text-gray-400";
  document.getElementById("price-starter").textContent =
    "$" + prices.starter[isAnnual ? 1 : 0];
  document.getElementById("price-pro").textContent =
    "$" + prices.pro[isAnnual ? 1 : 0];
}

function buildFAQ() {
  const container = document.getElementById("faq-list");
  if (!container) return;
  container.innerHTML = faqs
    .map(
      (f, i) => `
        <div class="border border-gray-200 rounded-xl overflow-hidden">
          <button onclick="toggleFAQ(${i})" class="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors">
            <span class="font-medium text-gray-800 text-sm">${f.q}</span>
            <i data-lucide="chevron-down" class="h-4 w-4 text-gray-400 flex-shrink-0 transition-transform" id="faq-icon-${i}"></i>
          </button>
          <div class="accordion-content" id="faq-content-${i}">
            <p class="px-6 pb-4 pt-1 text-gray-500 text-sm leading-relaxed">${f.a}</p>
          </div>
        </div>
      `,
    )
    .join("");
  lucide.createIcons();
}

function toggleFAQ(i) {
  const content = document.getElementById("faq-content-" + i);
  const icon = document.getElementById("faq-icon-" + i);
  content.classList.toggle("open");
  icon.style.transform = content.classList.contains("open")
    ? "rotate(180deg)"
    : "";
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-100",
    text: "text-indigo-600",
    badge: "bg-indigo-100 text-indigo-700",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  violet: {
    bg: "bg-violet-100",
    text: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
  },
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
  },
};

function buildResources(filter = "all") {
  const grid = document.getElementById("resource-grid");
  if (!grid) return;
  const filtered =
    filter === "all" ? resources : resources.filter((r) => r.type === filter);
  grid.innerHTML = filtered
    .map((r) => {
      const c = colorMap[r.color];
      return `
          <div class="resource-card bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer">
            <div class="${c.bg} h-36 flex items-center justify-center">
              <i data-lucide="${r.icon}" class="h-10 w-10 ${c.text}"></i>
            </div>
            <div class="p-6">
              <span class="inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge} mb-3">${r.tag}</span>
              <h3 class="font-display font-semibold text-gray-900 mb-2 leading-snug">${r.title}</h3>
              <p class="text-gray-500 text-sm leading-relaxed mb-4">${r.desc}</p>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400">${r.time}</span>
                <span class="${c.text} text-sm font-medium hover:underline">Read →</span>
              </div>
            </div>
          </div>
        `;
    })
    .join("");
  lucide.createIcons();
}

function filterResources(type) {
  document.querySelectorAll(".res-tab").forEach((btn) => {
    btn.classList.remove("active-tab", "bg-indigo-600", "text-white");
    btn.classList.add("bg-white", "border", "border-gray-200", "text-gray-600");
  });
  event.target.classList.add("active-tab", "bg-indigo-600", "text-white");
  event.target.classList.remove(
    "bg-white",
    "border",
    "border-gray-200",
    "text-gray-600",
  );
  buildResources(type);
}

// ---- Contact reason tabs ----
function setReason(btn) {
  document.querySelectorAll(".reason-btn").forEach((b) => {
    b.classList.remove("active-reason", "bg-indigo-600", "text-white");
    b.classList.add("border", "border-gray-200", "text-gray-600");
  });
  btn.classList.add("active-reason", "bg-indigo-600", "text-white");
  btn.classList.remove("border", "border-gray-200", "text-gray-600");
}

// ---- Contact submit ----
function submitContact() {
  document.getElementById("contact-form-wrap").classList.add("hidden");
  document.getElementById("contact-success").classList.remove("hidden");
  lucide.createIcons();
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  buildFAQ();
  buildResources();
});

/* =========================================================
      CAMPAIGN STATE
      ========================================================= */
let allCampaigns = [];
let currentFilter = "all";
let currentSearch = "";
let selectedCampaignId = null;
let selectedAmount = null;

/* =========================================================
      BUILD CAMPAIGN CARDS
      ========================================================= */
function buildCampaignCards(list) {
  const grid = document.getElementById("campaign-grid");
  const empty = document.getElementById("campaign-empty");
  const countEl = document.getElementById("campaign-count");
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    if (countEl) countEl.textContent = "0 campaigns";
    return;
  }
  empty.classList.add("hidden");
  if (countEl)
    countEl.textContent = `${list.length} campaign${list.length !== 1 ? "s" : ""}`;

  grid.innerHTML = list
    .map((c) => {
      const pct = Math.min(Math.round((c.raised / c.goal) * 100), 100);
      const overfunded = c.raised > c.goal;
      const categoryColors = {
        tech: "bg-indigo-100 text-indigo-700",
        art: "bg-violet-100 text-violet-700",
        community: "bg-emerald-100 text-emerald-700",
        health: "bg-rose-100 text-rose-700",
        education: "bg-amber-100 text-amber-700",
      };
      const catClass =
        categoryColors[c.category] || "bg-gray-100 text-gray-600";
      const catLabel = c.category.charAt(0).toUpperCase() + c.category.slice(1);

      return `
          <div class="campaign-card bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer" onclick="openCampaignDetail(${c.id})">
            <!-- Image -->
            <div class="overflow-hidden h-52 bg-gray-100 relative">
              <img src="${c.image}" alt="${c.name}" class="w-full h-full object-cover" loading="lazy" />
              <div class="absolute top-3 left-3">
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${catClass}">${catLabel}</span>
              </div>
              ${overfunded ? `<div class="absolute top-3 right-3"><span class="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-white">Overfunded 🎉</span></div>` : ""}
            </div>

            <!-- Body -->
            <div class="p-6">
              <h3 class="font-display text-lg font-semibold text-gray-900 mb-1 leading-snug">${c.name}</h3>
              <p class="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">${c.tagline}</p>

              <!-- Progress -->
              <div class="mb-4">
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="font-semibold text-gray-800">$${c.raised.toLocaleString()} raised</span>
                  <span class="font-semibold ${overfunded ? "text-amber-500" : "text-indigo-600"}">${pct}%</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div class="progress-bar-fill ${overfunded ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-gradient-to-r from-indigo-500 to-violet-500"} h-2 rounded-full" style="width:${pct}%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-400 mt-1.5">
                  <span>${c.backers.toLocaleString()} backers</span>
                  <span>${c.daysLeft} days left</span>
                </div>
              </div>

              <!-- Quick donate options -->
              <div class="flex gap-2 flex-wrap mb-4">
                ${(c.donationOptions || [10, 25, 50])
                  .map(
                    (amt) => `
                    <button
                      onclick="quickDonate(event, ${c.id}, ${amt})"
                      class="donate-btn px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
                    >$${amt}</button>
                `,
                  )
                  .join("")}
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-3 border-t border-gray-50">
                <span class="text-xs text-gray-400">by <span class="text-gray-600 font-medium">${c.creator}</span></span>
                <button
                  onclick="openCampaignDetail(${c.id})"
                  class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  Details <i data-lucide="arrow-right" class="h-3 w-3"></i>
                </button>
              </div>
            </div>
          </div>
        `;
    })
    .join("");

  lucide.createIcons();
}

/* =========================================================
      FILTERING & SEARCH
      ========================================================= */
function getFilteredCampaigns() {
  return allCampaigns.filter((c) => {
    const matchCat = currentFilter === "all" || c.category === currentFilter;
    const q = currentSearch.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.tagline.toLowerCase().includes(q) ||
      c.creator.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
}

function filterCampaigns(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll(".cat-tab").forEach((b) => {
    b.classList.remove("active-cat");
    b.classList.add("border-gray-200", "text-gray-600");
    b.classList.remove("border-indigo-600");
  });
  btn.classList.add("active-cat");
  btn.classList.remove("border-gray-200", "text-gray-600");
  buildCampaignCards(getFilteredCampaigns());
}

function searchCampaigns(q) {
  currentSearch = q;
  buildCampaignCards(getFilteredCampaigns());
}

/* =========================================================
      QUICK DONATE (from card, without opening detail)
      ========================================================= */
function quickDonate(e, campaignId, amount) {
  e.stopPropagation(); // don't open the detail page
  // For now, open the detail page with the amount pre-selected
  openCampaignDetail(campaignId, amount);
}

/* =========================================================
      CAMPAIGN DETAIL PAGE
      ========================================================= */
function openCampaignDetail(id, preselectedAmount = null) {
  const c = allCampaigns.find((x) => x.id === id);
  if (!c) return;

  if (typeof c.donationOptions === "string") {
    c.donationOptions = c.donationOptions.split(",").map(Number);
  }

  c.donationOptions = c.donationOptions || [10, 25, 50, 100];
  c.goals = Array.isArray(c.goals) ? c.goals : [];
  c.updates = Array.isArray(c.updates) ? c.updates : [];
  c.reviews = Array.isArray(c.reviews) ? c.reviews : [];

  selectedCampaignId = id;
  selectedAmount = preselectedAmount;

  // Populate
  document.getElementById("detail-image").src = c.image;
  document.getElementById("detail-image").alt = c.name;
  document.getElementById("detail-title").textContent = c.name;
  document.getElementById("detail-tagline").textContent = c.tagline;
  document.getElementById("detail-creator").textContent = c.creator;
  document.getElementById("detail-avatar").textContent = c.creator.charAt(0);

  const catColors = {
    tech: "bg-indigo-100 text-indigo-700",
    art: "bg-violet-100 text-violet-700",
    community: "bg-emerald-100 text-emerald-700",
    health: "bg-rose-100 text-rose-700",
    education: "bg-amber-100 text-amber-700",
  };
  const catBadge = document.getElementById("detail-category-badge");
  catBadge.textContent =
    c.category.charAt(0).toUpperCase() + c.category.slice(1);
  catBadge.className = `inline-block text-xs font-semibold px-3 py-1 rounded-full ${catColors[c.category] || "bg-gray-100 text-gray-600"}`;

  // Progress
  const pct = Math.min(Math.round((c.raised / c.goal) * 100), 100);
  document.getElementById("detail-raised").textContent =
    "$" + c.raised.toLocaleString();
  document.getElementById("detail-goal").textContent =
    "$" + c.goal.toLocaleString();
  document.getElementById("detail-percent").textContent = pct + "%";
  document.getElementById("detail-backers").textContent =
    c.backers.toLocaleString();
  document.getElementById("detail-days").textContent = c.daysLeft;
  setTimeout(() => {
    document.getElementById("detail-progress-bar").style.width = pct + "%";
  }, 100);

  // Description
  document.getElementById("detail-description").innerHTML =
    `<p>${c.description}</p>`;

  // Goals
  document.getElementById("detail-goals").innerHTML = (c.goals || [])
    .map(
      (g) => `
        <div class="flex items-center gap-3 p-3 rounded-xl ${g.done ? "bg-emerald-50 border border-emerald-100" : "bg-gray-50 border border-gray-100"}">
          <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${g.done ? "bg-emerald-500" : "border-2 border-gray-300"}">
            ${g.done ? '<i data-lucide="check" class="h-3 w-3 text-white"></i>' : ""}
          </div>
          <span class="text-sm ${g.done ? "text-emerald-800 font-medium" : "text-gray-500"}">${g.label}</span>
        </div>
      `,
    )
    .join("");

  // Risks
  document.getElementById("detail-risks").textContent = c.risks;

  // Updates
  document.getElementById("detail-updates").innerHTML = (c.updates || []).length
    ? (c.updates || [])
        .map(
          (u) => `
          <div class="border border-gray-100 rounded-2xl p-5">
            <div class="text-xs text-gray-400 mb-1">${u.date}</div>
            <h4 class="font-semibold text-gray-900 mb-2">${u.title}</h4>
            <p class="text-gray-500 text-sm leading-relaxed">${u.body}</p>
          </div>
        `,
        )
        .join("")
    : '<p class="text-gray-400 text-sm">No updates yet.</p>';

  // Reviews
  document.getElementById("detail-reviews").innerHTML = (c.reviews || []).length
    ? (c.reviews || [])
        .map(
          (r) => `
          <div class="flex gap-4 p-5 border border-gray-100 rounded-2xl">
            <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">${r.name.charAt(0)}</div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-gray-800 text-sm">${r.name}</span>
                <span class="flex gap-0.5">${Array.from({ length: 5 }, (_, i) => `<i data-lucide="star" class="h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}"></i>`).join("")}</span>
              </div>
              <p class="text-gray-500 text-sm leading-relaxed">${r.text}</p>
            </div>
          </div>
        `,
        )
        .join("")
    : '<p class="text-gray-400 text-sm">No reviews yet. Be the first to back this campaign!</p>';

  // Donation amount pills
  document.getElementById("detail-amount-pills").innerHTML = c.donationOptions
    .map(
      (amt) => `
        <button
          onclick="selectAmountPill(this, ${amt})"
          class="amount-pill border border-gray-200 rounded-xl py-2 text-sm font-semibold text-gray-700 hover:border-indigo-400 transition-all ${preselectedAmount === amt ? "selected" : ""}"
        >$${amt}</button>
      `,
    )
    .join("");

  if (preselectedAmount) {
    document.getElementById("detail-custom-amount").value = "";
  }

  // Reset tabs
  switchDetailTab("about");

  showPage("campaign-detail");
}

function selectAmountPill(btn, amount) {
  document
    .querySelectorAll(".amount-pill")
    .forEach((p) => p.classList.remove("selected"));
  btn.classList.add("selected");
  selectedAmount = amount;
  document.getElementById("detail-custom-amount").value = "";
}

function clearPillSelection() {
  document
    .querySelectorAll(".amount-pill")
    .forEach((p) => p.classList.remove("selected"));
  selectedAmount = null;
}

function handleDonate() {
  const customVal = document.getElementById("detail-custom-amount").value;
  const amount = selectedAmount || (customVal ? parseFloat(customVal) : null);
  if (!amount || amount <= 0) {
    alert("Please select or enter a donation amount.");
    return;
  }
  // TODO: wire this up to your backend payment endpoint
  alert(
    `Thank you! You've chosen to donate $${amount}. Payment integration coming soon.`,
  );
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert("Link copied to clipboard!");
  });
}

function switchDetailTab(tab) {
  ["about", "updates", "reviews"].forEach((t) => {
    document.getElementById("dtab-" + t).classList.remove("active-dtab");
    document.getElementById("dtab-" + t).classList.add("text-gray-500");
    document.getElementById("dtab-panel-" + t).classList.remove("active");
  });
  document.getElementById("dtab-" + tab).classList.add("active-dtab");
  document.getElementById("dtab-" + tab).classList.remove("text-gray-500");
  document.getElementById("dtab-panel-" + tab).classList.add("active");
  lucide.createIcons();
}

// Final Initialization Block in app.js
window.addEventListener("load", async () => {
  // Check if the user is logged in
  checkAuth();

  // Build the initial campaign cards
  try {
    const response = await fetch("/api/campaigns");
    const dbCampaigns = await response.json();

    if (dbCampaigns && dbCampaigns.length > 0) {
      // SANITIZE HERE: Fix the data once so it's ready for filtering AND details
      allCampaigns = dbCampaigns.map((c) => ({
        ...c,
        donationOptions:
          typeof c.donationOptions === "string"
            ? c.donationOptions.split(",").map(Number)
            : c.donationOptions || [10, 25, 50],
        goals:
          typeof c.goals === "string" ? JSON.parse(c.goals) : c.goals || [],
        updates:
          typeof c.updates === "string"
            ? JSON.parse(c.updates)
            : c.updates || [],
        reviews:
          typeof c.reviews === "string"
            ? JSON.parse(c.reviews)
            : c.reviews || [],
      }));
      buildCampaignCards(allCampaigns);
    } else {
      if (typeof campaigns !== "undefined") {
        allCampaigns = campaigns;
        buildCampaignCards(allCampaigns);
      }
    }
  } catch (err) {
    console.error("Failed to fetch campaigns:", err);
    if (typeof campaigns !== "undefined") {
      allCampaigns = campaigns;
      buildCampaignCards(allCampaigns);
    }
  }

  // Initialize the FAQ and Resources
  buildFAQ();
  buildResources();
  lucide.createIcons();
});
