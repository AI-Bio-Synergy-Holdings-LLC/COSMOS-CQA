(() => {
  document.querySelectorAll(".portal-header").forEach((header, index) => {
    if (!(header instanceof HTMLElement) || header.dataset.navigationReady === "true") return;

    const navigation = header.querySelector(".portal-nav");
    if (!(navigation instanceof HTMLElement)) return;

    const navigationId = navigation.id || `portal-navigation-${index + 1}`;
    const button = document.createElement("button");
    button.className = "portal-nav-toggle";
    button.type = "button";
    button.setAttribute("aria-controls", navigationId);
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = '<span>Menu</span><span class="portal-nav-toggle-icon" aria-hidden="true"><span></span><span></span><span></span></span>';

    const closeNavigation = () => {
      header.dataset.navigationOpen = "false";
      button.setAttribute("aria-expanded", "false");
    };

    navigation.id = navigationId;
    header.dataset.navigationOpen = "false";
    header.insertBefore(button, navigation);
    header.dataset.navigationReady = "true";

    button.addEventListener("click", () => {
      const willOpen = header.dataset.navigationOpen !== "true";
      header.dataset.navigationOpen = String(willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    });
    navigation.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) closeNavigation();
    });
    header.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || header.dataset.navigationOpen !== "true") return;
      closeNavigation();
      button.focus();
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", closeNavigation);
  });
})();
