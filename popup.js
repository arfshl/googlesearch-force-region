// Translate the page using the i18n messages
function translatePage() {
    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {
            const key =
                element.dataset.i18n;
            element.textContent =
                chrome.i18n.getMessage(key);
        });
}

// Get the UI language of the browser
async function loadStatus() {
    const settings =
        await chrome.storage.local.get({
            enabled: true,
            language: "en",
            region: "us"
        });

// Get the elements for displaying the status of the extension
    const enabled =
        document.getElementById("enabled");

// Get the elements for displaying the selected language and region
    const enabledText =
        document.getElementById("enabledText");

// Get the elements for displaying the selected language and region
    const language =
        document.getElementById("language");

// Get the elements for displaying the selected language and region
    const region =
        document.getElementById("region");

// Set the checkbox and text based on the settings
    enabled.checked =
        settings.enabled;

    enabledText.textContent =
        chrome.i18n.getMessage(
            settings.enabled
                ? "enabled"
                : "disabled"
        );

    language.textContent =
        settings.language;

    region.textContent =
        settings.region;
}

// Save the settings to storage and update the rules in the background script
document
    .getElementById("enabled")
    .addEventListener(
        "change",
        async event => {

            await chrome.storage.local.set({
                enabled:
                    event.target.checked
            });

            document
                .getElementById("enabledText")
                .textContent =
                    chrome.i18n.getMessage(
                        event.target.checked
                            ? "enabled"
                            : "disabled"
                    );
        }
    );

// Open settings page on new tab
document
    .getElementById("options")
    .addEventListener(
        "click",
        () => {

            chrome.tabs.create({
                url:
                    chrome.runtime.getURL(
                        "options.html"
                    )
            });
        }
    );

translatePage();
loadStatus();