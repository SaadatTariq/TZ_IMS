# T&Z Distribution ERP

A custom-built, modern Enterprise Resource Planning (ERP) application designed specifically for **T&Z Distribution**. This system streamlines inventory management, dynamic client billing, ledger tracking, and role-based access control.

## 🚀 Key Features

*   **Role-Based Authentication**: Secure login system with specific permissions for Admins and Employees.
*   **Dynamic Dashboard**: Real-time overview of revenue, inventory stock alerts, and recent billing activities.
*   **Inventory Management**:
    *   Track stock levels, MRP, CPU, and multiple client-specific Trade Prices (TP).
    *   **Bulk Upload**: Import hundreds of SKUs instantly using the built-in CSV Excel uploader.
*   **Smart Billing & Invoicing**:
    *   Dynamic client pricing (automatically applies specific TP based on the selected client).
    *   Smart product search by item code.
    *   Stock locking (prevents billing more items than physically available in stock).
    *   **Pad-Ready Print Layouts**: Invoices are precisely formatted, center-aligned, and auto-paginated to print perfectly onto pre-printed A4 company pads with adequate space for physical signatures.
*   **Dynamic Client Management**: Add and configure clients with specific display names, default pricing schemes, flat discounts, and custom invoice headers.
*   **Ledger & Finance**: Track payments against invoices and monitor client balances.

## 🛠️ Tech Stack

*   **Frontend Framework**: [React 18](https://react.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **State Management**: Zustand
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **CSV Parsing**: [PapaParse](https://www.papaparse.com/)

## 📦 Getting Started (Local Development)

Follow these instructions to get a copy of the project up and running on your local machine using VS Code.

### Prerequisites
*   [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
*   VS Code (or any preferred code editor)

### Installation

1.  **Extract the project** files and open the folder in VS Code.
2.  **Open the Terminal** in VS Code (`Ctrl + \``).
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Start the development server**:
    ```bash
    npm run dev
    ```
5.  **View the app**: `Ctrl + Click` the local link provided in the terminal (usually `http://localhost:3000` or `http://localhost:5173`).

## 🎨 Customizing the Branding (Logo)

To apply your company logo to the Login screen and the Sidebar:

1.  Locate the **`public`** folder in the root directory of the project.
2.  Place your logo image file inside the `public` folder.
3.  Ensure the file is named **exactly**: `logo.png`
4.  The system will automatically detect it and update the UI.

## 🔐 Default Demo Accounts

You can log into the system using any of the following pre-configured accounts:

| Name | Role | Password |
| :--- | :--- | :--- |
| Mohammed Tarique Ismail | Admin | `Admin001` |
| Mohammed Saadat Tariq | Admin | `Admin002` |
| Md Masum | Employee | `Emp001` |

## 📊 CSV Bulk Upload Format

When using the Bulk Upload feature in the Inventory tab, ensure your CSV file uses the following headers:

`Code, Barcode, Description, Unit, CPU, TP_CSD, TP_Captain, TP_Cooper, TP_Shumi, TP_Genius, TP_Overseas, MRP, Stock`

*(You can download a sample template directly from the Inventory page in the app by clicking the **Sample** button).*

---
*Built with ❤️ for T&Z Distribution.*
