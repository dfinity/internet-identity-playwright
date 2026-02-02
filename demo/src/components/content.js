import {renderLogout} from './logout';
import {renderModal} from './modal';
import {renderTable} from './table';
import {renderUser} from './user.js';

export const renderContent = (app) => {
  app.innerHTML = `<div>

    ${renderUser(app)}

    ${renderTable(app)}

    ${renderModal(app)}

    ${renderLogout(app)}
</div>`;
};
