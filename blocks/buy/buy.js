import { moveInstrumentation } from '../../scripts/scripts.js';
import {
  ul, li, div, h2, h3, p, button,
} from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  /* ---------------- HEADER ---------------- */
  const headerDiv = div({ class: 'buy-header' });

  // First row is subtitle (single cell)
  const firstRow = block.firstElementChild;
  let subtitle = '';
  let title = '';
  let buttonText = 'BUY NOW'; // Default value

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

  // Third row is button text (single cell)
  const thirdRow = block.firstElementChild;
  if (thirdRow && thirdRow.children.length === 1 && !thirdRow.querySelector('picture')) {
    buttonText = thirdRow.textContent.trim() || buttonText;
    thirdRow.remove();
  }

  if (subtitle) headerDiv.append(p({ class: 'buy-subtitle' }, subtitle));
  if (title) headerDiv.append(h2({ class: 'buy-title' }, title));

  /* ---------------- BUY ITEMS ---------------- */
  const buyList = ul({ class: 'buy-items' });

  [...block.children].forEach((row) => {
    const item = li({ class: 'buy-item' });
    moveInstrumentation(row, item);

    const cells = [...row.children];
    row.remove();

    const cardHeader = div({ class: 'buy-card-header' });
    const cardBody = div({ class: 'buy-card-body' });

    // Cell 0: buy-card-number (top left)
    if (cells[0]) {
      cardHeader.append(
        div({ class: 'buy-card-number' }, cells[0].textContent.trim()),
      );
    }

    // Cell 1: buy-card-duration (top right)
    if (cells[1]) {
      cardHeader.append(
        div({ class: 'buy-card-duration' }, cells[1].textContent.trim()),
      );
    }

    // Cell 2: buy-title (middle)
    if (cells[2]) {
      cardBody.append(
        h3({ class: 'buy-item-title' }, cells[2].textContent.trim()),
      );
    }

    // Cell 3: buy-description (bottom)
    if (cells[3]) {
      cardBody.append(
        p({ class: 'buy-item-desc' }, cells[3].textContent.trim()),
      );
    }

    item.append(cardHeader);
    item.append(cardBody);

    // Add click handler to show description
    item.addEventListener('click', () => {
      // Remove active class from all items
      buyList.querySelectorAll('.buy-item').forEach((i) => {
        i.classList.remove('active');
      });

      // Add active class to clicked item
      item.classList.add('active');
    });

    buyList.append(item);
  });

  /* ---------------- FINAL DOM ---------------- */
  block.textContent = '';
  if (headerDiv.children.length) block.append(headerDiv);

  // Create container with navigation buttons
  const swiperContainer = div({ class: 'buy-swiper-container' });
  const prevButton = button({ class: 'buy-swiper-prev', 'aria-label': 'Previous' }, '‹');
  const nextButton = button({ class: 'buy-swiper-next', 'aria-label': 'Next' }, '›');

  swiperContainer.append(prevButton);
  swiperContainer.append(buyList);
  swiperContainer.append(nextButton);
  block.append(swiperContainer);

  // Add scroll functionality
  const scrollAmount = 450; // Approximate width of one card + gap

  prevButton.addEventListener('click', () => {
    buyList.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth',
    });
  });

  nextButton.addEventListener('click', () => {
    buyList.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  });

  // Update button states based on scroll position
  const updateButtons = () => {
    const atStart = buyList.scrollLeft <= 0;
    const atEnd = buyList.scrollLeft >= buyList.scrollWidth - buyList.clientWidth - 10;

    prevButton.style.display = atStart ? 'none' : 'flex';
    nextButton.style.display = atEnd ? 'none' : 'flex';
  };

  buyList.addEventListener('scroll', updateButtons);
  // Initial check after a short delay to ensure DOM is ready
  setTimeout(updateButtons, 100);

  // Add button below cards
  const buyButton = button({ class: 'buy-cta-button' }, buttonText);
  block.append(buyButton);
}
