
# Vape Management Pro (VMP) 💨

A production-grade, AI-powered mobile management system for professional vapers. Designed with a **Clean Architecture** to be modular, extensible, and high-performance.

## 🚀 Core Features

### 1. Engine Lab (Advanced Calculator)
- **Resistance Estimation:** High-precision calculation based on wire gauge, ID, and wraps.
- **Heat Flux Analysis:** Predicts vapor warmth and ramp-up time (mW/mm²).
- **Surface Area Tracking:** Calculates wire surface area for optimal flavor profiling.

### 2. Battery Safety Guard 🛡️
- **Ohm's Law Integration:** Calculates real-time Amp draw based on resistance and voltage.
- **CDR Comparison:** Validates build safety against battery Continuous Discharge Rate.
- **Safety Margin Alerts:** Visual warnings for unsafe/low-resistance builds.

### 3. AI Intelligence (Gemini Integration)
- **Sweet Spot Discovery:** Recommends optimal wattage and airflow for specific e-liquids.
- **Degradation Modeling:** Predicts wick exhaustion based on consumption patterns and e-liquid viscosity.
- **Experience Analysis:** Summarizes technical journal entries into actionable tips.

### 4. Advanced Inventory System
- **Categorized Management:** Gear, Wires, Liquids, Cotton, Batteries, and Mods.
- **Cost Analytics:** Tracks prices and calculates cost-per-ml and monthly efficiency scores.
- **Visual Library:** Support for build photos and gear images.

### 5. Multilingual Localization (EN/FA)
- **English (Default):** Professional international terminology.
- **Farsi (Persian):** Specialized Iranian vaping terminology (e.g., "اتومایزر", "ویک مجدد", "سالت نیکوتین").

### 6. Offline-First Architecture
- **Persistent Storage:** Full `localStorage` integration with transactional-like safety.
- **Cloud Backup:** Integration UI for Google Drive, Dropbox, and manual exports.

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript.
- **Styling:** Tailwind CSS (Modern Glassmorphism Design).
- **AI Backend:** Google Gemini API (`gemini-3-flash-preview`).
- **Icons:** FontAwesome 6 (Professional Suite).

## 📱 How to Use
1. **Gear Up:** Add your atomizers and liquids in the **Gear** tab.
2. **Lab:** Use the **Lab** to calculate a safe build for your batteries.
3. **Initialize:** Go to the **Build** tab to register your new setup.
4. **Track:** Update ml consumption in the **Dashboard** as you vape.
5. **AI Help:** In the Build tab, click "AI Tuning" to get optimal settings for your juice.

---
*Built for Vapers, by Vapers. Always practice battery safety.*
