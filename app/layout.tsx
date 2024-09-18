import type { Metadata } from "next";
import "./globals.css";
import { ProjectProvider } from "./context/ProjectContext";
import { Appbar } from "./components/appbar";
import { Provider } from "./providers";

export const metadata: Metadata = {
  title: "Lazy-CRM",
  description:
    "A crm that wont make you explain your changes a million times to clients",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <ProjectProvider>
            <Appbar />
            <main className="pt-16"> {/* Add padding-top to account for the fixed Appbar */}
              {children}
            </main>
          </ProjectProvider>
        </Provider>
      </body>
    </html>
  );
}
