/**
 * Wait for an element to be rendered in the DOM before attaching a passive click event listener to it.
 * @param target The element or parent which its content will be updated / re-rendered.
 * @param selector The selector to the element to which the function should attach the click event.
 * @param fn The function to trigger on click.
 */
export const addEventClick = ({target, selector, fn}) => {
  const observer = new MutationObserver(() => {
    observer.disconnect();
    document.querySelector(selector)?.addEventListener('click', fn, {passive: true});
  });
  observer.observe(target, {childList: true, subtree: true});
};

export const reload = () => {
  const event = new Event('reload');
  window.dispatchEvent(event);
};
