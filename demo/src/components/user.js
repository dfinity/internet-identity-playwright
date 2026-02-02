import {getIdentityOnce} from '@junobuild/core';

export const renderUser = (app) => {
  const observer = new MutationObserver(async () => {
    observer.disconnect();

    const identity = await getIdentityOnce();
    document.querySelector('#identity').innerHTML = identity.getPrincipal().toText();
  });
  observer.observe(app, {childList: true, subtree: true});

  return `<p class="dark:text-white py-4 md:max-w-lg">
        <label for="identity">User:</label>
        <output id="identity" class="block"></output>
    </p>`;
};
