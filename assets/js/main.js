(function () {
  var doc = document;
  var win = window;
  var prefersReducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header = doc.querySelector(".site-header");
  var navToggle = doc.querySelector(".nav-toggle");
  var headerPanel = doc.querySelector(".header-panel");
  var siteNav = doc.getElementById("site-nav");
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.site-nav a[href^="#"]'));
  var navEntries = navLinks
    .map(function (link) {
      var section = doc.querySelector(link.getAttribute("href"));
      if (!section) {
        return null;
      }

      return {
        link: link,
        section: section
      };
    })
    .filter(Boolean)
    .sort(function (a, b) {
      return a.section.offsetTop - b.section.offsetTop;
    });
  var requestFrame = win.requestAnimationFrame
    ? win.requestAnimationFrame.bind(win)
    : function (callback) {
        return win.setTimeout(callback, 16);
      };
  var layoutSyncPending = false;

  function closeNav() {
    if (!header || !navToggle) {
      return;
    }

    header.classList.remove("is-nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function syncHeaderState() {
    if (header) {
      header.classList.toggle("is-scrolled", win.scrollY > 24);
    }
  }

  function syncActiveNav() {
    if (!navLinks.length || !navEntries.length) {
      return;
    }

    var activationLine = 260;
    var currentSection = null;
    var smallestDistance = Number.POSITIVE_INFINITY;

    navEntries.forEach(function (entry) {
      var rect = entry.section.getBoundingClientRect();
      var distance = Math.abs(rect.top - activationLine);

      if (rect.bottom > activationLine && distance < smallestDistance) {
        smallestDistance = distance;
        currentSection = entry.section;
      }
    });

    if (win.location.hash.length > 1) {
      var hashSection = doc.getElementById(win.location.hash.slice(1));
      if (hashSection) {
        var hashRect = hashSection.getBoundingClientRect();
        if (hashRect.top > -40 && hashRect.top < win.innerHeight * 0.4) {
          currentSection = hashSection;
        }
      }
    }

    navLinks.forEach(function (link) {
      var isActive = currentSection && link.getAttribute("href") === "#" + currentSection.id;
      link.classList.toggle("is-active", Boolean(isActive));
    });
  }

  function flushLayoutSync() {
    layoutSyncPending = false;
    syncHeaderState();
    syncActiveNav();
  }

  function scheduleLayoutSync() {
    if (layoutSyncPending) {
      return;
    }

    layoutSyncPending = true;
    requestFrame(flushLayoutSync);
  }

  if (header || navEntries.length) {
    scheduleLayoutSync();
    win.addEventListener("scroll", scheduleLayoutSync, { passive: true });
    win.addEventListener("resize", scheduleLayoutSync);
    win.addEventListener("hashchange", scheduleLayoutSync);
    win.addEventListener("load", scheduleLayoutSync);
  }

  if (navToggle && header && headerPanel) {
    navToggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("is-nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeNav();
      }
    });

    doc.addEventListener("click", function (event) {
      if (!header.contains(event.target)) {
        closeNav();
      }
    });
  }

  var ctaSourceField = doc.querySelector('input[name="cta_source"]');
  var sendPlansSection = doc.getElementById("send-plans");

  function scrollToSection(section, source) {
    if (!section) {
      return;
    }

    if (ctaSourceField && source) {
      ctaSourceField.value = source;
    }

    section.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  doc.querySelectorAll("[data-open-form]").forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      var href = trigger.getAttribute("href");
      if (href === "#send-plans") {
        event.preventDefault();
        scrollToSection(sendPlansSection, trigger.dataset.ctaSource || "direct");
        closeNav();
      }
    });
  });

  doc.querySelectorAll("[data-book-call-placeholder]").forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
    });
  });

  function initTabGroup(group) {
    var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
    if (!tabs.length) {
      return;
    }

    var stage = group.querySelector("[data-tab-stage]");
    var inlineTabsMedia = win.matchMedia("(max-width: 1080px)");
    var panels = tabs
      .map(function (tab) {
        var panelId = tab.getAttribute("aria-controls");
        return panelId ? doc.getElementById(panelId) : null;
      })
      .filter(Boolean);

    var restorePanelsToStage = function () {
      if (!stage) {
        return;
      }

      panels.forEach(function (panel) {
        if (panel.parentNode !== stage) {
          stage.appendChild(panel);
        }
      });
    };

    var syncInlinePanelPlacement = function (activeTab) {
      if (!stage) {
        return;
      }

      restorePanelsToStage();

      if (!inlineTabsMedia.matches || !activeTab) {
        return;
      }

      var panelId = activeTab.getAttribute("aria-controls");
      var activePanel = panelId ? doc.getElementById(panelId) : null;
      var slot = activeTab.closest("[data-tab-slot]");

      if (activePanel && slot && activePanel.parentNode !== slot) {
        slot.appendChild(activePanel);
      }
    };

    var activateTab = function (nextTab, moveFocus) {
      tabs.forEach(function (tab) {
        var isActive = tab === nextTab;
        var panelId = tab.getAttribute("aria-controls");
        var panel = panelId ? doc.getElementById(panelId) : null;

        tab.setAttribute("aria-selected", String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
        tab.classList.toggle("is-active", isActive);

        if (panel) {
          panel.hidden = !isActive;
          panel.classList.toggle("is-active", isActive);
        }
      });

      syncInlinePanelPlacement(nextTab);

      if (moveFocus) {
        nextTab.focus();
      }
    };

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activateTab(tab, false);
      });

      tab.addEventListener("keydown", function (event) {
        var nextIndex = index;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        activateTab(tabs[nextIndex], true);
      });
    });

    var defaultTab = tabs.find(function (tab) {
      return tab.getAttribute("aria-selected") === "true";
    }) || tabs[0];

    activateTab(defaultTab, false);

    var syncActiveTabLayout = function () {
      var activeTab = tabs.find(function (tab) {
        return tab.getAttribute("aria-selected") === "true";
      }) || defaultTab;

      activateTab(activeTab, false);
    };

    if (inlineTabsMedia.addEventListener) {
      inlineTabsMedia.addEventListener("change", syncActiveTabLayout);
    } else if (inlineTabsMedia.addListener) {
      inlineTabsMedia.addListener(syncActiveTabLayout);
    }
  }

  doc.querySelectorAll("[data-tab-group]").forEach(initTabGroup);

  var faqItems = Array.prototype.slice.call(doc.querySelectorAll(".faq-list .faq-item"));
  if (faqItems.length) {
    faqItems.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) {
          return;
        }

        faqItems.forEach(function (otherItem) {
          if (otherItem !== item) {
            otherItem.open = false;
          }
        });
      });
    });
  }

  var revealItems = doc.querySelectorAll(".reveal");
  if (!prefersReducedMotion && "IntersectionObserver" in win) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  if (siteNav) {
    siteNav.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  var params = new URLSearchParams(win.location.search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(function (name) {
    var field = doc.querySelector('input[name="' + name + '"]');
    if (field) {
      field.value = params.get(name) || "";
    }
  });

  var pageSourceField = doc.querySelector('input[name="page_source"]');
  if (pageSourceField) {
    pageSourceField.value = win.location.pathname + win.location.search;
  }

  if (ctaSourceField && !ctaSourceField.value) {
    ctaSourceField.value = "direct";
  }

  var roleField = doc.getElementById("role");
  var homeownerHelper = doc.querySelector("[data-homeowner-helper]");

  function syncRoleHelper() {
    if (!roleField || !homeownerHelper) {
      return;
    }

    var isHomeowner = roleField.value === "Homeowner";
    homeownerHelper.hidden = !isHomeowner;
  }

  if (roleField) {
    syncRoleHelper();
    roleField.addEventListener("change", syncRoleHelper);
  }

  var leadForm = doc.querySelector(".lead-form");
  if (leadForm) {
    var feedback = leadForm.querySelector(".form-feedback");
    var requiredControls = Array.prototype.slice.call(leadForm.querySelectorAll("[required]"));
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function getLabel(control) {
      var label = leadForm.querySelector('label[for="' + control.id + '"]');
      return label ? label.textContent.trim() : "This field";
    }

    function getErrorContainer(control, index) {
      var field = control.closest(".field");
      if (!field) {
        return null;
      }

      var errorId = control.id ? control.id + "-error" : "field-error-" + index;
      var error = field.querySelector(".field-error");

      if (!error) {
        error = doc.createElement("div");
        error.className = "field-error";
        error.id = errorId;
        error.setAttribute("aria-live", "polite");
        field.appendChild(error);
      }

      control.setAttribute("aria-describedby", errorId);
      return error;
    }

    function hasValue(control) {
      if (control.type === "file") {
        return Boolean(control.files && control.files.length);
      }

      return control.value.trim() !== "";
    }

    function setError(control, message, index) {
      var error = getErrorContainer(control, index);
      control.setAttribute("aria-invalid", message ? "true" : "false");
      if (error) {
        error.textContent = message || "";
      }
    }

    function validateControl(control, index) {
      var message = "";
      var value = control.type === "file" ? control.value : control.value.trim();

      if (control.hasAttribute("required") && !hasValue(control)) {
        message = getLabel(control) + " is required.";
      } else if (control.type === "email" && value && !emailPattern.test(value)) {
        message = "Enter a valid email address.";
      }

      setError(control, message, index);
      return !message;
    }

    requiredControls.forEach(function (control, index) {
      getErrorContainer(control, index);

      ["input", "change", "blur"].forEach(function (eventName) {
        control.addEventListener(eventName, function () {
          validateControl(control, index);
          if (feedback) {
            feedback.textContent = "";
          }
        });
      });
    });

    leadForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;
      requiredControls.forEach(function (control, index) {
        var isValid = validateControl(control, index);
        if (!isValid && !firstInvalid) {
          firstInvalid = control;
        }
      });

      if (firstInvalid) {
        if (feedback) {
          feedback.textContent = "Please review the highlighted fields.";
        }
        firstInvalid.focus();
        return;
      }

      if (feedback) {
        feedback.textContent = "";
      }
    });
  }
})();
