const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelectorAll(".nav a");
const form = document.querySelector("#consultForm");
const statusText = document.querySelector(".form-status");
const copyButton = document.querySelector(".wechat-copy");

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

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get("name");
  const sport = data.get("sport");

  statusText.textContent = `${name}，你的${sport}咨询已记录。请添加微信 18902543881 确认活动安排。`;
  form.reset();
});
