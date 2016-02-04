const status = document.getElementById('status');
const username = document.getElementById('username');
const token = document.getElementById('token');

chrome.storage.sync.get(res => {
  username.value = (res && res.username) || '';
  token.value = (res && res.token) || '';
});

document.getElementById('save').addEventListener('click', () => {
  chrome.storage.sync.set({
    username: username.value,
    token: token.value
  }, () => {
    // Update status to let user know options were saved.
    status.textContent = 'Options saved.';
    setTimeout(() => {
      status.textContent = '';
      window.close();
    }, 750);
  });
});
