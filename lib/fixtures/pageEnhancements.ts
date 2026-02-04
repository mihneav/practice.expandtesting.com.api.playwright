import { Page } from "@playwright/test";

export async function setupPageEnhancements(page: Page): Promise<void> {
  /**
   * Ad blocking script
   * Removes common ad elements from the page to enhance test reliability
   */
  await page.addInitScript(() => {
    const removeAds = () => {
      const adSelectors = [
        // Google Ads iframes
        'iframe[id*="google_ads"]',
        'iframe[id*="aswift"]',
        'iframe[src*="google"]',
        'iframe[src*="doubleclick"]',
        // AdSense elements
        "ins.adsbygoogle",
        'ins[class*="ad"]',
        // Generic ad containers
        '[id*="ad-"]',
        '[id*="ad_"]',
        '[class*="ad-"]',
        '[class*="ad_"]',
        '[id*="advertisement"]',
        '[class*="advertisement"]',
        '[class*="AdContainer"]',
        '[class*="ad_container"]',
        'div[id*="ads"]',
        'div[class*="ads"]',
        "[data-ad-slot]",
        "[data-google-query-id]",
        // Additional selectors
        '[id*="google_ad"]',
        '[class*="google-ad"]',
        "ins[data-ad-client]",
        ".fc-consent-root",
      ];

      let removed = 0;
      adSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          // Also hide parent if it's just a wrapper
          if (
            el.parentElement &&
            el.parentElement.children.length === 1 &&
            el.parentElement.tagName !== "BODY"
          ) {
            el.parentElement.remove();
          } else {
            el.remove();
          }
          removed++;
        });
      });

      // Also add CSS to hide any ads that might load later
      if (!document.getElementById("ad-blocking-styles")) {
        const style = document.createElement("style");
        style.id = "ad-blocking-styles";
        style.textContent = `
        ins.adsbygoogle,
        ins[class*="ad"],
        [id*="google_ads"],
        [id*="aswift"],
        [data-ad-slot],
        [data-google-query-id] {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
        }
      `;
        document.head.appendChild(style);
      }

      console.log(`Removed ${removed} ad elements`);
    };

    // Run on different lifecycle events
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", removeAds);
    } else {
      removeAds();
    }

    // Watch for dynamically added ads
    const observer = new MutationObserver((mutations) => {
      removeAds();
    });

    // Start observing when document is ready
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      });
    }
  });

  /**
   * Enhanced locator click
   * Overrides the default locator click to ensure the element is scrolled into view before clicking
   */
  const originalLocator = page.locator.bind(page);
  page.locator = function (selector: string, options?: any) {
    const loc = originalLocator(selector, options);
    const originalClick = loc.click.bind(loc);

    loc.click = async function (options?: any) {
      await loc.scrollIntoViewIfNeeded();
      return originalClick(options);
    };

    return loc;
  };
}
