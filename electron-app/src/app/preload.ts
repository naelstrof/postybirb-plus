/* tslint:disable: no-console no-var-requires variable-name */
import { remote, clipboard, shell } from 'electron';
const { app, session } = remote;

// Authorizers
const Tumblr = require('./authorizers/tumblr.auth');
const DeviantArt = require('./authorizers/deviant-art.auth');

const _setImmediate = setImmediate;
const _clearImmediate = clearImmediate;
const _Buffer = Buffer;
process.once('loaded', () => {
  global.setImmediate = _setImmediate;
  global.clearImmediate = _clearImmediate;
  global.Buffer = _Buffer;
});

(window as any).PORT = (remote.getCurrentWindow() as any).PORT;
(window as any).AUTH_ID = (remote.getCurrentWindow() as any).AUTH_ID;
(window as any).IS_DARK_THEME = (remote.getCurrentWindow() as any).IS_DARK_THEME;
(window as any).AUTH_SERVER_URL = (remote.getCurrentWindow() as any).AUTH_SERVER_URL;
(window as any).appVersion = app.getVersion();
(window as any).electron = {
  clipboard: {
    availableFormats: clipboard.availableFormats,
    read() {
      const ni = clipboard.readImage();
      const arr = new Uint8Array(ni.toPNG());
      const blob = new Blob([arr], { type: 'image/png' });
      return new File([blob], 'Clipboard Image', { lastModified: Date.now(), type: 'image/png' });
    },
  },
  session: {
    getCookies(accountId) {
      return session.fromPartition(`persist:${accountId}`).cookies.get({});
    },
    clearSessionData(id) {
      return session.fromPartition(`persist:${id}`).clearStorageData();
    },
  },
  shell: {
    openInBrowser(url) {
      return shell.openExternal(url);
    },
  },
  kill: () => app.quit(),
  auth: {
    Tumblr,
    DeviantArt,
  },
};
