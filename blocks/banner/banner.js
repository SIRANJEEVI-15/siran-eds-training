export default function decorate(block) {
  // Add your banner block functionality here
  const items = [...block.children];
  
  items.forEach((item) => {
    item.classList.add('banner-item');
  });
}
