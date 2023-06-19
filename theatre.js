const SET_GRID = ".page-video-detail .wrapper { grid-template-columns: minmax(20px,auto) minmax(auto,1320px) 0px minmax(20px,auto); }";
const HIDE_SIDEVIDEOS = ".page-video-detail .sidevideos { display: none; }";
const TITLE_APPLY = "Apply CSS";
const TITLE_REMOVE = "Remove CSS";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];
const URL_REGEX = /https:\/\/.*\.talktv\.cz\/video\/.*/;

/*
Toggle CSS: based on the current title, insert or remove the CSS.
Update the page action's title and icon to reflect its state.
*/
function toggleCSS(tab) {

  function gotTitle(title) {
    if (title === TITLE_APPLY) {
      browser.pageAction.setIcon({tabId: tab.id, path: "icons/on.svg"});
      browser.pageAction.setTitle({tabId: tab.id, title: TITLE_REMOVE});
      browser.tabs.insertCSS({code: SET_GRID});
      browser.tabs.insertCSS({code: HIDE_SIDEVIDEOS});
    } else {
      browser.pageAction.setIcon({tabId: tab.id, path: "icons/off.svg"});
      browser.pageAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
      browser.tabs.removeCSS({code: SET_GRID});
      browser.tabs.removeCSS({code: HIDE_SIDEVIDEOS});
    }
  }

  let gettingTitle = browser.pageAction.getTitle({tabId: tab.id});
  gettingTitle.then(gotTitle);
}

/*
Returns true only if the URL's protocol is in APPLICABLE_PROTOCOLS.
Argument url must be a valid URL string.
*/
function protocolIsApplicable(url) {
  const protocol = (new URL(url)).protocol;
  return APPLICABLE_PROTOCOLS.includes(protocol);
}

/*
Initialize the page action: set icon and title, then show.
Only operates on tabs whose URL's protocol is applicable.
*/
function initializePageAction(tab) {
  if (protocolIsApplicable(tab.url) && URL_REGEX.test(tab.url)) {
    browser.pageAction.setIcon({tabId: tab.id, path: "icons/off.svg"});
    browser.pageAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
    browser.pageAction.show(tab.id);
  }
}

/*
When first loaded, initialize the page action for all tabs.
*/
let gettingAllTabs = browser.tabs.query({});
gettingAllTabs.then((tabs) => {
  for (let tab of tabs) {
    initializePageAction(tab);
  }
});

/*
Each time a tab is updated, reset the page action for that tab.
*/
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  initializePageAction(tab);
});

/*
Toggle CSS when the page action is clicked.
*/
browser.pageAction.onClicked.addListener(toggleCSS);
