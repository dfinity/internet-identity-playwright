import {authSubscribe, initSatellite} from '@junobuild/core';
import {renderContent} from './components/content';
import {renderLogin} from './components/login';
import './style.css';

/**
 * Global listener. When the user sign-in or sign-out, we re-render the app.
 */
authSubscribe((user) => {
  const app = document.querySelector('#app');

  if (user === null || user === undefined) {
    renderLogin(app);
    return;
  }

  renderContent(app);
});

/**
 * When the app starts, we initialize Juno.
 * @returns {Promise<void>}
 */
const onAppInit = async () => {
  await initSatellite();
};

document.addEventListener('DOMContentLoaded', onAppInit, {once: true});
