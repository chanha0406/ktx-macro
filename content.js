let uid = 1;
const MAIN_URI =
    "https://www.letskorail.com/ebizprd/EbizPrdTicketPr21111_i1.do";
const LOGIN_PAGE_URI = "https://www.letskorail.com/korail/com/login.do";

const createCheckbox = () => {
    const $rows = document.querySelectorAll("#tableResult > tbody > tr");

    if (!$rows.length) {
        return;
    }

    $rows.forEach(($row) => {
        $row.querySelector("td:nth-child(5)").insertAdjacentHTML(
            "beforeend",
            getCheckboxTemplate(uid++)
        );
        $row.querySelector("td:nth-child(6)").insertAdjacentHTML(
            "beforeend",
            getCheckboxTemplate(uid++)
        );
        $row.querySelector("td:nth-child(10)").insertAdjacentHTML(
            "beforeend",
            getCheckboxTemplate(uid++)
        );
    });
};

const isChecked = (uid) => {
    const checkedItemsStr = sessionStorage.getItem("checkedItems");
    const checkedItems = checkedItemsStr ? checkedItemsStr.split(",") : [];

    if (!checkedItems.length) {
        return false;
    }

    return checkedItems.includes(String(uid));
};

const isLogin = () => !!document.querySelectorAll(".gnb_list > .log_nm").length;

const getCheckboxTemplate = (uid) => {
    if (!uid) {
        return;
    }

    return `
    <div>
      <label>
        <input type="checkbox" class="ktx-macro-checkbox" value="${uid}" ${
        isChecked(uid) && "checked"
    }>
        매크로
      </label>
    </div>
  `;
};

const setCheckboxEvent = () => {
    const $checkboxes = document.querySelectorAll(".ktx-macro-checkbox");

    for (let i = 0; i < $checkboxes.length; i++) {
        $checkboxes[i].addEventListener("click", () => {
            saveCheckboxState();
        });
    }
};

const setEscapeEvent = () => {
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            macroStop();
        }
    });
};

const macroStart = () => {
    if (!isLogin()) {
        if (
            confirm("로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?")
        ) {
            location.href = LOGIN_PAGE_URI;
        }
        return;
    }

    if (!sessionStorage.getItem("checkedItems")) {
        alert("선택 된 항목이 없습니다.\n1개 이상 선택해주세요.");
        return;
    }

    alert(
        "자동 예매를 시작합니다.\n" +
            "예매 성공 후 20분내에 결제하지 않을 경우 자동으로 예매가 취소됩니다.\n" +
            "자동 예매 종료는 '자동 예매 정지' 혹은 esc키를 눌러주세요."
    );

    sessionStorage.setItem("macro_start", "on");

    reload();
};

const macroStop = () => {
    alert("자동 예매를 종료합니다.");
    sessionStorage.removeItem("macro_start");
    sessionStorage.removeItem("checkedItems");

    reload();
};

function waitForElm(selector) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

const macro = () => {
    waitForElm("#tableResult > tbody > tr").then(() => {
        let uid = 0;
        let $row;
        const $rows = document.querySelectorAll("#tableResult > tbody > tr");
        const len = $rows.length;

        if (!len) {
            return;
        }

        for (let i = 0; i < len; i++) {
            $row = $rows[i];

            if (isChecked(++uid)) {
                $row.querySelector("td:nth-child(5)").style.backgroundColor =
                    "#f03e3e";
                const $button =
                    $row
                        .querySelector("td:nth-child(5)")
                        .querySelector(
                            '[src="/docs/2007/img/common/icon_apm_bl.gif"]'
                        ) ||
                    $row
                        .querySelector("td:nth-child(5)")
                        .querySelector(
                            '[src="/docs/2007/img/common/icon_apm_rd.gif"]'
                        );

                if ($button) {
                    $button.closest("a").click();
                    sessionStorage.removeItem("macro_start");
                    chrome.extension.sendMessage({ type: "successTicketing" });
                    break;
                }
            }

            if (isChecked(++uid)) {
                $row.querySelector("td:nth-child(6)").style.backgroundColor =
                    "#f03e3e";
                const $button =
                    $row
                        .querySelector("td:nth-child(6)")
                        .querySelector(
                            '[src="/docs/2007/img/common/icon_apm_bl.gif"]'
                        ) ||
                    $row
                        .querySelector("td:nth-child(6)")
                        .querySelector(
                            '[src="/docs/2007/img/common/icon_apm_rd.gif"]'
                        );

                if ($button) {
                    $button.closest("a").click();
                    sessionStorage.removeItem("macro_start");
                    chrome.extension.sendMessage({ type: "successTicketing" });
                    break;
                }
            }

            if (isChecked(++uid)) {
                $row.querySelector("td:nth-child(10)").style.backgroundColor =
                    "#f03e3e";
                const $button = $row
                    .querySelector("td:nth-child(10)")
                    .querySelector(
                        '[src="/docs/2007/img/common/icon_wait.gif"]'
                    );

                if ($button) {
                    $button.closest("a").click();
                    sessionStorage.removeItem("macro_start");
                    chrome.extension.sendMessage({ type: "successTicketing" });
                    break;
                }
            }
        }
        // inqSchedule();
        reload();
    });
};

const reload = () => {
    // document.querySelector(".btn_inq > a").click();
    inqSchedule();
};

const saveCheckboxState = () => {
    let checkedItems = [];
    const $checkboxes = document.querySelectorAll(".ktx-macro-checkbox");

    for (let i = 0; i < $checkboxes.length; i++) {
        if ($checkboxes[i].checked) {
            checkedItems.push($checkboxes[i].value);
        }
    }

    if (checkedItems.length) {
        sessionStorage.setItem("checkedItems", checkedItems.join(","));
    } else {
        sessionStorage.removeItem("checkedItems");
    }
};

(() => {
    if (
        !document.querySelector(".btn_inq") ||
        !location.href.startsWith(MAIN_URI)
    ) {
        return;
    }

    const isStarted = sessionStorage.getItem("macro_start") === "on";

    if (isStarted) {
        macro();
        setEscapeEvent();
    } else {
        sessionStorage.removeItem("checkedItems");
    }

    document.querySelector(".btn_inq").insertAdjacentHTML(
        "beforeend",
        `
      <button type="button" class="ktx-macro-button">
        ${isStarted ? "자동 예매 정지" : "자동 예매 시작"}
      </button>
    `
    );

    document
        .querySelector(".ktx-macro-button")
        .addEventListener("click", isStarted ? macroStop : macroStart);

    createCheckbox();
    setCheckboxEvent();
})();
