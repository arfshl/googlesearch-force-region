// Translate the page content using i18n messages
function translatePage() {
    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {
            const key = element.dataset.i18n;

            element.textContent =
                chrome.i18n.getMessage(key);
        });
}


// Get the UI language of the browser
function getUILanguage() {
    return chrome.i18n
        .getUILanguage()
        .toLowerCase()
        .split("-")[0];
}


// Get the localized name of an item based on the UI language
function getLocalizedName(item) {
    const locale = getUILanguage();

    return (
        item.names[locale] ||
        item.names.en
    );
}


// Create a checkbox element for a given item, type, and selected code
function createCheckbox(item, type, selectedCode) {

    const label =
        document.createElement("label");

    label.className =
        "flex cursor-pointer items-center gap-3 px-4 py-2 " +
        "hover:bg-gray-100 dark:hover:bg-gray-900";


    const radio =
        document.createElement("input");

    radio.type = "radio";

    radio.name = type;

    radio.className = "hidden";

    radio.value =
        item.code;

    radio.checked =
        item.code === selectedCode;

    radio.dataset.type =
        type;


    // Bullet

    const bullet =
        document.createElement("span");

    bullet.className =
        "option-bullet h-3 w-3 shrink-0 rounded-full " +
        "border border-gray-400 " +
        "dark:border-gray-500";


    function updateBullet() {

        if (radio.checked) {

            bullet.className =
                "option-bullet h-3 w-3 shrink-0 rounded-full " +
                "border-[3px] border-blue-500 " +
                "bg-transparent";

        } else {

            bullet.className =
                "option-bullet h-3 w-3 shrink-0 rounded-full " +
                "border border-gray-400 " +
                "dark:border-gray-500";

        }

    }


    radio.addEventListener(
        "change",
        () => {

            document
                .querySelectorAll(
                    `input[data-type="${type}"]`
                )
                .forEach(other => {

                    const otherBullet =
                        other.parentElement
                            .querySelector(
                                ".option-bullet"
                            );

                    if (!otherBullet) {
                        return;
                    }


                    if (other.checked) {

                        otherBullet.className =
                            "option-bullet " +
                            "h-3 w-3 shrink-0 rounded-full " +
                            "border-[3px] border-blue-500 " +
                            "bg-transparent";

                    } else {

                        otherBullet.className =
                            "option-bullet " +
                            "h-3 w-3 shrink-0 rounded-full " +
                            "border border-gray-400 " +
                            "dark:border-gray-500";

                    }

                });

        }
    );


    const name =
        document.createElement("span");

    name.className =
        "text-sm text-gray-800 dark:text-gray-200";

    name.textContent =
        getLocalizedName(item);


    label.appendChild(radio);
    label.appendChild(bullet);
    label.appendChild(name);


    updateBullet();


    return label;
}

// Load the settings from storage
// and populate the UI
async function loadSettings() {

    const settings =
        await chrome.storage.local.get({
            enabled: true,
            language: "en",
            region: "us"
        });


    // Get container elements
    const regions =
        document.getElementById("regions");

    const languages =
        document.getElementById("languages");


    // Clear existing content
    regions.innerHTML = "";
    languages.innerHTML = "";


    // Populate regions
    REGIONS.forEach(item => {

        regions.appendChild(
            createCheckbox(
                item,
                "region",
                settings.region
            )
        );

    });


    // Populate languages
    LANGUAGES.forEach(item => {

        languages.appendChild(
            createCheckbox(
                item,
                "language",
                settings.language
            )
        );

    });
}


// Save the selected settings
async function saveSettings() {

    const region =
        document.querySelector(
            'input[data-type="region"]:checked'
        );

    const language =
        document.querySelector(
            'input[data-type="language"]:checked'
        );


    // If either is not selected,
    // do not save
    if (!region || !language) {
        return;
    }


    // Save selected region and language
    await chrome.storage.local.set({
        region: region.value,
        language: language.value
    });


    // Show saved status
    const status =
        document.getElementById("status");

    status.textContent =
        chrome.i18n.getMessage("saved");


    setTimeout(() => {
        status.textContent = "";
    }, 2000);
}


// Save button
document
    .getElementById("save")
    .addEventListener(
        "click",
        saveSettings
    );


// Initialize
translatePage();
loadSettings();