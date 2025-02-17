import {authSubscribe, setDoc, uploadFile} from '@junobuild/core';
import {nanoid} from 'nanoid';
import {addEventClick, reload} from '../utils/utils';

let user;
authSubscribe((u) => (user = u));

const submitEntry = async (modal) => {
  // Demo purpose therefore edge case not properly handled
  if ([null, undefined].includes(user)) {
    return;
  }

  const textarea = modal.querySelector('#entryText');
  const input = modal.querySelector('#fileEntry');

  const inputText = textarea.value;
  const file = input.files[0];

  try {
    let url;

    if (file !== undefined) {
      const filename = `${user.key}-${file.name}`;

      const {downloadUrl} = await uploadFile({
        collection: 'images',
        data: file,
        filename
      });

      url = downloadUrl;
    }

    const key = nanoid();

    await setDoc({
      collection: 'notes',
      doc: {
        key,
        data: {
          text: inputText,
          ...(url !== undefined && {url})
        }
      }
    });

    closeModal(modal);

    reload();
  } catch (err) {
    console.error(err);
  }
};

const closeModal = (modal) => (modal.innerHTML = '');

const showModal = () => {
  const modal = document.querySelector('#modal');

  addEventClick({
    target: modal,
    selector: '#closeModal',
    fn: () => closeModal(modal)
  });

  addEventClick({
    target: modal,
    selector: '#submitEntry',
    fn: async () => await submitEntry(modal)
  });

  modal.innerHTML = `<div class="fixed inset-0 z-50 p-16 md:px-24 md:py-44 animate-fade" role="dialog">
            <div class="relative w-full max-w-xl">
            <textarea id="entryText"
                class="form-control
        block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        m-0
        resize-none
        border-black border-[3px] rounded-sm bg-white shadow-[5px_5px_0px_rgba(0,0,0,1)]
        focus:outline-hidden"
                rows="7"
                placeholder="Your diary entry"></textarea>

<div role="toolbar" class="flex justify-between items-center">
<div>
                  <input
                  id="fileEntry"
                    type="file"
                  />
                </div>
                
                <div class="flex my-4">
                    <button
                        id="closeModal"
                      class="py-1 px-8 hover:text-lavender-blue-600 active:text-lavender-blue-400"
                      type="button">
                      Close
                    </button>
    
    <button id="submitEntry"
      class="flex items-center gap-2 border-black dark:border-lavender-blue-500 border-[3px] transition-all rounded-xs py-1 px-8 my-2 font-semibold text-white bg-lavender-blue-500 dark:bg-black shadow-[5px_5px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_#7888ff] hover:bg-lavender-blue-600 dark:hover:bg-lavender-blue-300 dark:hover:text-black active:bg-lavender-blue-400 dark:active:bg-lavender-blue-500 active:shadow-none active:translate-x-[5px] active:translate-y-[5px]">
      Submit
    </button>
                    
                  </div>
</div>
                
  </div>
</div>

<div class="fixed inset-0 z-40 backdrop-blur-xl bg-white/30 flex items-center justify-center"></div>
`;
};

export const renderModal = (app) => {
  addEventClick({
    target: app,
    selector: '#addEntry',
    fn: showModal
  });

  return `<button
    id="addEntry"
    type="button"
    class="dark:text-white flex items-center gap-2 mt-24 hover:text-lavender-blue-500 active:text-lavender-blue-400">
    Add an entry 
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20"
          viewBox="0 -960 960 960"
          width="20"
          fill="currentColor">
          <path d="M417-417H166v-126h251v-251h126v251h251v126H543v251H417v-251Z" />
        </svg>
  </button>

  <div id="modal" class="contents"></div>
`;
};
