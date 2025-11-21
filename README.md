<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WarrantyGuard AI

**WarrantyGuard AI** is an intelligent application designed to simplify how you manage your household appliances and electronics. Instead of hoarding paper receipts and forgetting when warranties expire, simply snap a photo of your bill or warranty card. Our AI handles the rest.

## 🚀 Features

-   **📸 AI-Powered Scanning:** Upload a photo of a receipt, invoice, or product box. Google Gemini AI automatically detects product details, purchase dates, and warranty periods.
-   **🛡️ Warranty Tracking:** valid documents are processed to calculate exactly when your warranty expires.
-   **📊 Smart Dashboard:** Get a clear overview of all your devices, their status, and upcoming expirations.
-   **☁️ Secure Cloud Storage:** Your receipt images are safely stored in the cloud (Firebase Storage), so you never lose a proof-of-purchase again.
-   **🔐 User Authentication:** Secure login ensures your data is private and accessible only to you.

## 🛠️ Tech Stack

-   **Frontend:** React (v19), TypeScript, Vite
-   **Styling:** Tailwind CSS
-   **AI Integration:** Google Gemini API (`gemini-2.5-flash`)
-   **Backend & Storage:** Firebase (Auth, Firestore, Storage)
-   **Icons:** Lucide React

## 🏃‍♂️ Run Locally

1.  **Clone the repository** (if applicable) or navigate to the project folder.

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

4.  **Open in Browser:**
    The terminal will show a local URL (usually `http://localhost:5173`). Open this link to use the app.

## 📂 Project Structure

-   **`/components`**: UI building blocks (Dashboard, Device Cards, Setup Guide).
-   **`/services`**:
    -   `geminiService.ts`: Handles communication with Google Gemini for image analysis.
    -   `firebase.ts` & `storageService.ts`: Manages database and file storage interactions.
-   **`App.tsx`**: The main application logic and routing.

## 🔑 Key Artifacts

-   **Input:** Images of Bills/Receipts (JPEG/PNG).
-   **Output:** Structured JSON data containing Product Name, Category, Purchase Date, and Warranty Expiry.

---
*Generated for WarrantyGuard AI*
