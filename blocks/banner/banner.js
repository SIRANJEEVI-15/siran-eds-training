import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { ul, li, div, h2, p } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  // Extract header content if exists (subtitle and title)
  const headerDiv = div({ class: 'banner-header' });
  const firstRow = block.firstElementChild;
  
  if (firstRow) {
    const cells = [...firstRow.children];
    if (cells.length >= 2) {
      // First cell is subtitle, second is title
      const subtitle = cells[0]?.textContent?.trim();
      const title = cells[1]?.textContent?.trim();
      
      if (subtitle) headerDiv.append(p({ class: 'banner-subtitle' }, subtitle));
      if (title) headerDiv.append(h2({ class: 'banner-title' }, title));
      
      firstRow.remove();
    }
  }

  // Create card list for banner items
  const bannerList = ul(
    { class: 'banner-items' },
    ...([...block.children].map((row) => {
      const item = li();
      moveInstrumentation(row, item);

      while (row.firstElementChild) item.append(row.firstElementChild);

      [...item.children].forEach((child) => {
        if (child.children.length === 1 && child.querySelector('picture')) {
          child.className = 'banner-item-image';
        } else {
          child.className = 'banner-item-body';
        }
      });

      return item;
    })),
  );

  bannerList.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  if (headerDiv.children.length > 0) block.append(headerDiv);
  block.append(bannerList);
}
