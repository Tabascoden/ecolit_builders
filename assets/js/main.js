(function () {
  var doc = document;
  var win = window;
  var prefersReducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header = doc.querySelector(".site-header");
  var navToggle = doc.querySelector(".nav-toggle");
  var siteNav = doc.getElementById("site-nav");

  function closeNav() {
    if (!header || !navToggle) {
      return;
    }

    header.classList.remove("is-nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (header) {
    var syncHeaderState = function () {
      header.classList.toggle("is-scrolled", win.scrollY > 18);
    };

    syncHeaderState();
    win.addEventListener("scroll", syncHeaderState, { passive: true });
  }

  if (navToggle && siteNav && header) {
    navToggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("is-nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeNav();
      }
    });

    siteNav.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  var leadSection = doc.getElementById("lead-form");
  var leadForm = doc.querySelector(".lead-form");
  var firstFormControl = leadForm ? leadForm.querySelector("input, select, textarea") : null;
  var ctaSourceField = doc.querySelector('input[name="cta_source"]');

  function scrollToLead(source) {
    if (ctaSourceField && source) {
      ctaSourceField.value = source;
    }

    if (leadSection) {
      leadSection.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
    }
  }

  doc.querySelectorAll("[data-open-form]").forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      var href = trigger.getAttribute("href");
      if (href === "#lead-form") {
        event.preventDefault();
        scrollToLead(trigger.dataset.ctaSource || "direct");
      }
    });
  });

  var comparisonSection = doc.querySelector(".comparison-section");
  if (comparisonSection) {
    var tabs = comparisonSection.querySelectorAll(".comparison-tab");
    var panels = comparisonSection.querySelectorAll(".comparison-panel");

    tabs.forEach(function (button) {
      button.addEventListener("click", function () {
        var tab = button.dataset.tab || "permit";
        comparisonSection.setAttribute("data-comparison-tab", tab);

        tabs.forEach(function (item) {
          var isActive = item === button;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-selected", String(isActive));
        });

        panels.forEach(function (panel) {
          var isActive = panel.dataset.panel === tab;
          panel.classList.toggle("is-active", isActive);
          if (isActive) {
            panel.classList.add("is-visible");
          }
        });
      });
    });

    comparisonSection.querySelectorAll(".comparison-visual").forEach(function (visual) {
      var defaultSplit = Number(visual.dataset.defaultSplit || 54);

      function setSplit(clientX) {
        var rect = visual.getBoundingClientRect();
        var ratio = (clientX - rect.left) / rect.width;
        var split = Math.min(82, Math.max(18, ratio * 100));
        visual.style.setProperty("--split", split.toFixed(2) + "%");
      }

      visual.style.setProperty("--split", defaultSplit + "%");

      visual.addEventListener("mousemove", function (event) {
        setSplit(event.clientX);
      });

      visual.addEventListener("mouseleave", function () {
        visual.style.setProperty("--split", defaultSplit + "%");
      });

      visual.addEventListener("touchmove", function (event) {
        if (event.touches && event.touches[0]) {
          setSplit(event.touches[0].clientX);
        }
      }, { passive: true });

      visual.addEventListener("touchend", function () {
        visual.style.setProperty("--split", defaultSplit + "%");
      });
    });
  }

  doc.querySelectorAll("[data-install-switch]").forEach(function (switcher) {
    var tabs = switcher.querySelectorAll("[data-install-tab]");
    var panels = switcher.querySelectorAll("[data-install-panel]");
    var defaultTab = switcher.getAttribute("data-install-default") || "supervisor";

    function setInstallTab(tabName) {
      tabs.forEach(function (tab) {
        var isActive = tab.dataset.installTab === tabName;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
      });

      panels.forEach(function (panel) {
        panel.classList.toggle("is-active", panel.dataset.installPanel === tabName);
      });
    }

    setInstallTab(defaultTab);

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        setInstallTab(tab.dataset.installTab || defaultTab);
      });
    });
  });

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
      rootMargin: "0px 0px -10% 0px"
    });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.site-nav a[href^="#"]'));
  if ("IntersectionObserver" in win && navLinks.length) {
    var sections = navLinks
      .map(function (link) {
        return doc.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);

    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, {
      threshold: 0.45,
      rootMargin: "-20% 0px -55% 0px"
    });

    sections.forEach(function (section) {
      navObserver.observe(section);
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

  if (leadForm) {
    var feedback = leadForm.querySelector(".form-feedback");
    var successPanel = doc.querySelector(".form-success");
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

    function setError(control, message, index) {
      var error = getErrorContainer(control, index);
      control.setAttribute("aria-invalid", message ? "true" : "false");
      if (error) {
        error.textContent = message || "";
      }
    }

    function validateControl(control, index) {
      var value = control.value.trim();
      var message = "";

      if (control.hasAttribute("required") && !value) {
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

      leadForm.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
      }
    });
  }

  doc.querySelectorAll("[data-focus-form]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      scrollToLead("focus_trigger");
      if (firstFormControl) {
        win.setTimeout(function () {
          firstFormControl.focus();
        }, prefersReducedMotion ? 0 : 220);
      }
    });
  });
})();
