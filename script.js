const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelectorAll(".nav a");
const form = document.querySelector("#consultForm");
const statusText = document.querySelector(".form-status");
const copyButton = document.querySelector(".wechat-copy");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const filterButtons = document.querySelectorAll(".filter-chip");
const sportCards = document.querySelectorAll(".sport-card");
const sportDetail = document.querySelector(".sport-detail");
const modal = document.querySelector("#signupModal");
const modalEvent = document.querySelector(".modal-event strong");
const quickForm = document.querySelector("#quickForm");
const modalStatus = document.querySelector(".modal-status");
const openSignupButtons = document.querySelectorAll(".open-signup");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const apiBaseUrl = window.location.hostname.endsWith("github.io") ? "https://qiangyun-sports.onrender.com" : "";

const submitInquiry = async (payload) => {
  const response = await fetch(`${apiBaseUrl}/api/inquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("submit_failed");
  }

  return response.json();
};

const showFallbackMessage = (target, name, sport) => {
  target.textContent = `${name}，你的${sport}咨询没有保存到后台。请刷新页面后再试，或先添加微信 18902543881。`;
};

menuButton?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

copyButton?.addEventListener("click", async () => {
  const value = copyButton.dataset.copy || "";
  try {
    await navigator.clipboard.writeText(value);
    copyButton.textContent = "已复制微信号";
  } catch {
    copyButton.textContent = `微信：${value}`;
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 },
);

revealItems.forEach((item) => revealObserver.observe(item));

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const target = Number(entry.target.dataset.count || 0);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 24));
      const timer = window.setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          window.clearInterval(timer);
        }
        entry.target.textContent = String(current);
      }, 36);

      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.5 },
);

counters.forEach((counter) => counterObserver.observe(counter));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    sportCards.forEach((card) => {
      const tags = card.dataset.tags || "";
      card.classList.toggle("is-hidden", filter !== "all" && !tags.includes(filter));
    });
  });
});

sportCards.forEach((card) => {
  card.addEventListener("click", () => {
    sportCards.forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");
    sportDetail.innerHTML = `<strong>${card.querySelector("h3")?.textContent || "运动项目"}</strong><span>${card.dataset.detail}</span>`;
  });
});

const openModal = (eventName) => {
  modalEvent.textContent = eventName || "强运城市运动日";
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modal.querySelector("input")?.focus();
};

const closeModal = () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

openSignupButtons.forEach((button) => {
  button.addEventListener("click", () => openModal(button.dataset.event));
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const sport = String(data.get("sport") || "").trim();

  statusText.textContent = "正在提交...";

  try {
    const result = await submitInquiry({
      name,
      contact: String(data.get("phone") || "").trim(),
      sport,
      message: String(data.get("message") || "").trim(),
      source: "contact_form",
    });
    statusText.textContent = `${name}，你的${sport}咨询已保存到后台。记录编号：${result.id}`;
    form.reset();
  } catch {
    showFallbackMessage(statusText, name, sport || "运动活动");
  }
});

quickForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(quickForm);
  const nickname = String(data.get("nickname") || "").trim();
  const eventName = modalEvent.textContent;

  modalStatus.textContent = "正在提交...";

  try {
    const result = await submitInquiry({
      name: nickname,
      contact: String(data.get("contact") || "").trim(),
      sport: "活动报名",
      event: eventName,
      source: "quick_modal",
    });
    modalStatus.textContent = `${nickname}，${eventName}报名意向已保存到后台。记录编号：${result.id}`;
    quickForm.reset();
  } catch {
    modalStatus.textContent = `${nickname}，报名意向没有保存到后台。请刷新页面后再试，或先添加微信 18902543881。`;
  }
});
