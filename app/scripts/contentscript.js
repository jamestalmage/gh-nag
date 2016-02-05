'use strict';
import xhrRequest from 'xhr-request';

function fillElement(el, opts) {
  if (opts.class) {
    opts.class.forEach(c => el.classList.add(c));
  }
  if (opts.attr) {
    Object.keys(opts.attr).forEach(key => el.setAttribute(key, opts.attr[key]));
  }
  return el;
}

const container = document.getElementById('user-links');

function addButton(opts) {
  const navItem = document.createElement('li');
  navItem.classList.add('header-nav-item');

  const dataChannel = document.createElement('span');
  navItem.appendChild(dataChannel);

  const link = fillElement(document.createElement('a'), {
    class: ['header-nav-link', 'notification-indicator', 'tooltipped', 'tooltipped-s'],
    attr: {
      'href' : opts.href,
      'aria-label': opts.tooltip
    }
  });
  dataChannel.appendChild(link);

  const svgns = "http://www.w3.org/2000/svg";

  const svg = fillElement(document.createElementNS(svgns, "svg"), {
    class: ['octicon', 'octicon-bell'],
    attr: {
      'aria-hidden': 'true',
      'height': '16',
      'weight': '14',
      'viewBox': '0 0 14 16'
    }
  });
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  link.appendChild(svg);

  const path = document.createElementNS(svgns, 'path');
  path.setAttributeNS(null, 'd', opts.path);

  svg.appendChild(path);

  const count = document.createElement('span');
  link.appendChild(count);

  container.insertBefore(navItem, container.childNodes[0]);

  return function (status) {
    count.innerText = status;
  }
}

function fetch(q, token, cb) {
  xhrRequest('https://api.github.com/search/issues', {
    json: true,
    headers: {
      'accept': 'application/vnd.github.v3+json',
      'authorization': 'token ' + token
    },
    query: {q}
  }, cb);
}

chrome.storage.sync.get(res => {
  if (!(res && res.username && res.username.length)) {
    return;
  }
  const {token, username} = res;

  const issues = addButton({
    href: `https://github.com/issues?q=is:open+type:issue+user:"${username}"`,
    tooltip: 'issues',
    path: 'M7 2.3c3.14 0 5.7 2.56 5.7 5.7S10.14 13.7 7 13.7 1.3 11.14 1.3 8s2.56-5.7 5.7-5.7m0-1.3C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7S10.86 1 7 1z m1 3H6v5h2V4z m0 6H6v2h2V10z'
  });

  const pullRequests = addButton({
    href: `https://github.com/pulls?q=is:open+type:pr+user:"${username}"`,
    tooltip: 'pull requests',
    path: 'M11 11.28c0-1.73 0-6.28 0-6.28-0.03-0.78-0.34-1.47-0.94-2.06s-1.28-0.91-2.06-0.94c0 0-1.02 0-1 0V0L4 3l3 3V4h1c0.27 0.02 0.48 0.11 0.69 0.31s0.3 0.42 0.31 0.69v6.28c-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72z m-1 2.92c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2zM4 3c0-1.11-0.89-2-2-2S0 1.89 0 3c0 0.73 0.41 1.38 1 1.72 0 1.55 0 5.56 0 6.56-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72V4.72c0.59-0.34 1-0.98 1-1.72z m-0.8 10c0 0.66-0.55 1.2-1.2 1.2s-1.2-0.55-1.2-1.2 0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2z m-1.2-8.8c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2z'
  });

  fetch(`user:"${username}" state:open is:issue`, token, (err, res) => {
    if (err) {
      console.log('Error fetching data for issues');
      console.log(err);
      return;
    }
    issues(String(res.total_count));
  });

  fetch(`user:"${username}" state:open is:pr`, token, (err, res) => {
    if (err) {
      console.log('Error fetching data for prs');
      console.log(err);
      return;
    }
    pullRequests(String(res.total_count));
  });
});
