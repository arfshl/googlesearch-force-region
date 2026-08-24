// interface for both chromium and firefox
// so that 1 background.js file can be used for both browsers
const API =
    typeof browser !== "undefined"
        ? browser
        : chrome;


const RULE_ID = 1;

// default settings for the extension
const DEFAULT_SETTINGS = {
    enabled: true,
    language: "en",
    region: "us"
};

// get the settings from storage, or use default settings if not set
async function getSettings() {
    return await API.storage.sync.get(
        DEFAULT_SETTINGS
    );
}

// update the declarativeNetRequest rules based on the settings:
async function updateRules() {
    const settings =
        await getSettings();

// remove the existing rule, if any
    await API.declarativeNetRequest
        .updateDynamicRules({
            removeRuleIds: [
                RULE_ID
            ]
        });

// if the extension is disabled, do not add any rules
    if (!settings.enabled) {
        return;
    }

// add a new rule to redirect Google Search requests with the specified region and language
    await API.declarativeNetRequest
        .updateDynamicRules({
            addRules: [
                {
                    id: RULE_ID,
                    priority: 1,
                    action: {
                        type: "redirect",
                        redirect: {
                            transform: {
                                queryTransform: {
                                    addOrReplaceParams: [
                                        {
                                            key: "gl",
                                            value: settings.region
                                        },
                                        {
                                            key: "hl",
                                            value: settings.language
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    condition: {
                        urlFilter: "||www.google.com/",
                        resourceTypes: [
                            "main_frame"
                        ]
                    }
                }
            ]
        });
}

// update the current active Google tab with the specified region and language
async function updateCurrentGoogleTab() {
    const settings =
        await getSettings();
    const tabs =
        await API.tabs.query({
            active: true,
            currentWindow: true
        });
    const tab = tabs[0];

// if the current tab is not a Google Search tab, do nothing
    if (!tab?.id || !tab.url) {
        return;
    }
    if (
        !tab.url.startsWith(
            "https://www.google.com/"
        )
    ) {
        return;
    }

// create a new URL object from the current tab's URL
    const url =
        new URL(tab.url);
    if (settings.enabled) {
        url.searchParams.set(
            "gl",
            settings.region
        );

        url.searchParams.set(
            "hl",
            settings.language
        );
    } else {
        url.searchParams.delete("gl");

        url.searchParams.delete("hl");
    }
    await API.tabs.update(
        tab.id,
        {
            url: url.toString()
        }
    );

}

// apply the settings by updating the rules and the current Google tab
async function applySettings() {
    await updateRules();
    await updateCurrentGoogleTab();
}

// apply the settings when the extension is installed, when the browser starts, or when the settings are changed
API.runtime.onInstalled.addListener(
    applySettings
);

// apply the settings when the browser starts
API.runtime.onStartup.addListener(
    applySettings
);

// apply the settings when the settings are changed
API.storage.onChanged.addListener(
    applySettings
);