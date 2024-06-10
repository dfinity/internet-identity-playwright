import {renderLogout} from './logout';
import {renderModal} from './modal';
import {renderTable} from './table';

export const renderContent = (app) => {
  app.innerHTML = `<div>

    ${renderTable(app)}

    ${renderModal(app)}

    ${renderLogout(app)}
</div>`;
};
