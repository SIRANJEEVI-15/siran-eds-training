import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import {
  ul, li, div, h2, h3, p, button,
} from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  /* ---------------- HEADER ---------------- */
  const headerDiv = div({ class: 'banner-header' });

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

  if (subtitle) headerDiv.append(p({ class: 'banner-subtitle' }, subtitle));
  if (title) headerDiv.append(h2({ class: 'banner-title' }, title));

  /* ---------------- BANNER ITEMS ---------------- */
  const bannerList = ul({ class: 'banner-items' });

  [...block.children].forEach((row) => {
    const item = li({ class: 'banner-item' });
    moveInstrumentation(row, item);

    const cells = [...row.children];
    row.remove();

    const media = div({ class: 'banner-media' });
    const overlay = div({ class: 'banner-overlay' });

    cells.forEach((cell, index) => {
      // IMAGE CELL
      if (cell.querySelector('picture')) {
        const img = cell.querySelector('img');

        const optimizedPicture = createOptimizedPicture(
          img.src,
          img.alt,
          false,
          [{ width: '750' }],
        );

        moveInstrumentation(img, optimizedPicture.querySelector('img'));
        cell.querySelector('picture').replaceWith(optimizedPicture);

        cell.className = 'banner-item-image';
        media.append(cell);
      } else if (index === 1) {
        // TITLE
        overlay.append(
          h3({ class: 'banner-item-title' }, cell.textContent.trim()),
        );
      } else if (index === 2) {
        // DESCRIPTION
        overlay.append(
          p({ class: 'banner-item-desc' }, cell.textContent.trim()),
        );
      }
    });

    media.append(overlay);
    item.append(media);

    // Add click handler to show description
    item.addEventListener('click', () => {
      // Remove active class from all items
      bannerList.querySelectorAll('.banner-item').forEach((i) => {
        i.classList.remove('active');
      });

      // Add active class to clicked item
      item.classList.add('active');
    });

    bannerList.append(item);
  });

  /* ---------------- FINAL DOM ---------------- */
  block.textContent = '';
  if (headerDiv.children.length) block.append(headerDiv);
  
  // Create container with navigation buttons
  const swiperContainer = div({ class: 'banner-swiper-container' });
  const prevButton = button({ class: 'banner-swiper-prev', 'aria-label': 'Previous' }, '‹');
  const nextButton = button({ class: 'banner-swiper-next', 'aria-label': 'Next' }, '›');
  
  swiperContainer.append(prevButton);
  swiperContainer.append(bannerList);
  swiperContainer.append(nextButton);
  block.append(swiperContainer);
  
  // Add scroll functionality
  const scrollAmount = 450; // Approximate width of one card + gap
  
  prevButton.addEventListener('click', () => {
    bannerList.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth',
    });
  });
  
  nextButton.addEventListener('click', () => {
    bannerList.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  });
  
  // Update button states based on scroll position
  const updateButtons = () => {
    const atStart = bannerList.scrollLeft <= 0;
    const atEnd = bannerList.scrollLeft >= bannerList.scrollWidth - bannerList.clientWidth - 10;
    
    prevButton.style.display = atStart ? 'none' : 'flex';
    nextButton.style.display = atEnd ? 'none' : 'flex';
  };
  
  bannerList.addEventListener('scroll', updateButtons);
  // Initial check after a short delay to ensure DOM is ready
  setTimeout(updateButtons, 100);
}
