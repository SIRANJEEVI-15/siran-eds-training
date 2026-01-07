import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { ul, li } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const bannerList = ul(
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

  block.replaceChildren(bannerList);
}
