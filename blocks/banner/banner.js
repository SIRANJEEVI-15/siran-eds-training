import { createOptimizedPicture } from "../../scripts/aem.js";
import { moveInstrumentation } from "../../scripts/scripts.js";
import { ul, li, div, h2, h3, p } from "../../scripts/dom-helpers.js";

export default function decorate(block) {
  /* ---------------- HEADER ---------------- */
  const headerDiv = div({ class: "banner-header" });
  
  // First row is subtitle (single cell)
  const firstRow = block.firstElementChild;
  let subtitle = '';
  let title = '';
  
  if (firstRow && firstRow.children.length === 1 && !firstRow.querySelector('picture')) {
    subtitle = firstRow.textContent.trim();
    firstRow.remove();
  }
  
  // Second row is title (single cell)
  const secondRow = block.firstElementChild;
  if (secondRow && secondRow.children.length === 1 && !secondRow.querySelector('picture')) {
    title = secondRow.textContent.trim();
    secondRow.remove();
  }

  if (subtitle) headerDiv.append(p({ class: "banner-subtitle" }, subtitle));
  if (title) headerDiv.append(h2({ class: "banner-title" }, title));

  /* ---------------- BANNER ITEMS ---------------- */
  const bannerList = ul({ class: "banner-items" });

  [...block.children].forEach((row) => {
    const item = li({ class: "banner-item" });
    moveInstrumentation(row, item);

    const cells = [...row.children];
    row.remove();

    const media = div({ class: "banner-media" });
    const overlay = div({ class: "banner-overlay" });

    cells.forEach((cell, index) => {
      // IMAGE CELL
      if (cell.querySelector("picture")) {
        const img = cell.querySelector("img");

        const optimizedPicture = createOptimizedPicture(
          img.src,
          img.alt,
          false,
          [{ width: "750" }]
        );

        moveInstrumentation(img, optimizedPicture.querySelector("img"));
        cell.querySelector("picture").replaceWith(optimizedPicture);

        cell.className = "banner-item-image";
        media.append(cell);
      }

      // TITLE
      else if (index === 1) {
        overlay.append(
          h3({ class: "banner-item-title" }, cell.textContent.trim())
        );
      }

      // DESCRIPTION
      else if (index === 2) {
        overlay.append(
          p({ class: "banner-item-desc" }, cell.textContent.trim())
        );
      }
    });

    media.append(overlay);
    item.append(media);
    
    // Add click handler to show description (only if not already active)
    item.addEventListener('click', () => {
      if (!item.classList.contains('active')) {
        item.classList.add('active');
      }
    });
    
    bannerList.append(item);
  });

  /* ---------------- FINAL DOM ---------------- */
  block.textContent = "";
  if (headerDiv.children.length) block.append(headerDiv);
  block.append(bannerList);
}
