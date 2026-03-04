// ==UserScript==
// @name         ClickUp Time Tracker on Google Meet
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Automatyczny start/stop timera ClickUp + Inteligentny Timer Bazowy
// @author       Bartłomiej Dąbrowski
// @match        https://meet.google.com/*
// @grant        GM_xmlhttpRequest
// @connect      api.clickup.com
// @updateURL    https://raw.githubusercontent.com/bdabrowski-lang/ClickUp-Time-Tracker-Base/main/clickup-meet-tracker.user.js
// @downloadURL  https://raw.githubusercontent.com/bdabrowski-lang/ClickUp-Time-Tracker-Base/main/clickup-meet-tracker.user.js
// ==/UserScript==

(function () {

    'use strict';
    // ==========================================================
    // 1. KONFIGURACJA
    // ==========================================================
    const API_KEY = ''; //Prywatny klucz API CLickUp'a

    // Opcje timera bazowego
    const ENABLE_BASE_TIMER = falseś; //uruchomienie domyślnego timera po opuszczeniu spotkania
    const BASE_TASK_ID = '86c1tk27q'; //ID domyślnego zadania (timera)
    const BASE_TASK_DESC = 'Praca własna'; //Opis domyślnego timera (informacja przekazywana do CU i wyświetlana w ogólnym trackerze

    // Słownik zadań z trackerami, które wykorzystujemy
    // "[fraza nazwy spotkania]: "[ID zadania w CU]
    const MEETING_DICTIONARY = {
        "daily": "86c1tk27q",
    };

    // ==========================================================
    // ZMIENNE SYSTEMOWE
    // ==========================================================
    let currentTeamId = null;
    let isTrackingStarted = false; // Status dla aktywnego spotkania
    let isBaseTimerRunning = false; // Status dla timera bazowego
    let lastCheckedTitle = "";

    async function getTeamId() {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://api.clickup.com/api/v2/team",
                headers: { "Authorization": API_KEY },
                onload: function (response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        if (data.teams && data.teams.length > 0) resolve(data.teams[0].id);
                    } catch (e) { console.error("Błąd pobierania Team ID", e); }
                }
            });
        });
    }

    // Start timera (z flagą typu)
    function startClickUpTimer(teamId, taskId, description, isBase = false) {
        GM_xmlhttpRequest({
            method: "POST",
            url: `https://api.clickup.com/api/v2/team/${teamId}/time_entries/start`,
            headers: {
                "Authorization": API_KEY,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({ "description": description, "tid": taskId }),
            onload: function (response) {
                if (response.status === 200) {
                    console.log(`✅ ClickUp: Start ${isBase ? 'BAZY' : 'SPOTKANIA'} (${description})`);
                    if (isBase) {
                        isBaseTimerRunning = true;
                        isTrackingStarted = false;
                    } else {
                        isTrackingStarted = true;
                        isBaseTimerRunning = false;
                    }
                }
            }
        });
    }

    // Stop timera
    function stopClickUpTimer(triggerBase = false) {
        GM_xmlhttpRequest({
            method: "POST",
            url: `https://api.clickup.com/api/v2/team/${currentTeamId}/time_entries/stop`,
            headers: { "Authorization": API_KEY },
            onload: function (response) {
                if (response.status === 200) {
                    console.log("⏹️ ClickUp: Zatrzymano śledzenie.");
                    isTrackingStarted = false;
                    isBaseTimerRunning = false;
                    lastCheckedTitle = "";

                    if (triggerBase && ENABLE_BASE_TIMER) {
                        startClickUpTimer(currentTeamId, BASE_TASK_ID, BASE_TASK_DESC, true);
                    }
                }
            }
        });
    }

    async function checkMeetingStatus() {
        const titleElement = document.querySelector('[data-meeting-title]');
        const titleText = titleElement ? titleElement.getAttribute('data-meeting-title') : "";

        // SCENARIUSZ A: Wykryto spotkanie
        if (titleText && titleText !== lastCheckedTitle) {
            const lowerTitle = titleText.toLowerCase();
            let targetTaskId = null;

            for (const [keyword, taskId] of Object.entries(MEETING_DICTIONARY)) {
                if (lowerTitle.includes(keyword.toLowerCase())) {
                    targetTaskId = taskId;
                    break;
                }
            }

            if (targetTaskId && currentTeamId) {
                lastCheckedTitle = titleText;
                // Przełączamy na spotkanie niezależnie od tego czy działa baza
                startClickUpTimer(currentTeamId, targetTaskId, titleText, false);
            }
        }

        // SCENARIUSZ B: Wyjście ze spotkania (brak tytułu, a śledzenie spotkania było aktywne)
        if (!titleText && isTrackingStarted) {
            stopClickUpTimer(true);
        }
    }

    // Zamknięcie karty - stop bez restartu bazy
    window.addEventListener('beforeunload', () => {
        if (isTrackingStarted || isBaseTimerRunning) {
            GM_xmlhttpRequest({
                method: "POST",
                url: `https://api.clickup.com/api/v2/team/${currentTeamId}/time_entries/stop`,
                headers: { "Authorization": API_KEY }
            });
        }
    });

    async function init() {
        console.log("🚀 ClickUp Meet Tracker v1.5 zainicjowany.");
        currentTeamId = await getTeamId();
        if (currentTeamId) setInterval(checkMeetingStatus, 3000);
    }
    init();
})();
