# ClickUp Time Tracker for Google Meet 🕒

Automatyzacja śledzenia czasu w ClickUp bezpośrednio z poziomu Google Meet. Skrypt rozpoznaje tytuł spotkania i przypisuje czas do odpowiedniego zadania w Twoim obszarze roboczym ClickUp.

## ✨ Funkcje
- **Automatyczny Start:** Uruchamia timer ClickUp po dołączeniu do spotkania (na podstawie słów kluczowych w tytule).
- **Inteligentny Stop:** Zatrzymuje timer po opuszczeniu spotkania lub zamknięciu karty.
- **Timer Bazowy (v1.5):** Po zakończeniu spotkania skrypt może automatycznie przełączyć się na Twoje główne zadanie (np. "Praca własna").
- **Auto-aktualizacja:** Skrypt automatycznie sprawdza dostępność nowej wersji w tym repozytorium.

## 🚀 Instalacja

1. Zainstaluj rozszerzenie **Tampermonkey** w swojej przeglądarce (Chrome, Firefox, Edge).
2. Kliknij w plik `clickup-meet-tracker.user.js` w tym repozytorium.
3. Kliknij przycisk **"Raw"**.
4. Tampermonkey automatycznie wykryje skrypt i zaproponuje jego instalację. Kliknij **"Zainstaluj"**.

## ⚙️ Konfiguracja

Aby skrypt działał poprawnie, musisz edytować sekcję `KONFIGURACJA` w kodzie skryptu:

1. **API_KEY:** Pobierz swój klucz API z ustawień ClickUp (*Settings > Apps > API Token*).
2. **MEETING_DICTIONARY:** Dodaj słowa kluczowe występujące w tytułach Twoich spotkań i przypisz im ID zadań z ClickUp.
3. **BASE_TASK_ID:** Podaj ID zadania, które ma się uruchamiać po zakończeniu spotkań (jeśli opcja jest włączona).

```javascript
const API_KEY = 'pk_your_token_here';
const ENABLE_BASE_TIMER = true; // true = włączone, false = wyłączone
const BASE_TASK_ID = '86c1tk27q';
