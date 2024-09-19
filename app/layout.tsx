import type { Metadata } from "next";
import "./globals.css";
import { ProjectProvider } from "./context/ProjectContext";
import { Appbar } from "./components/appbar";
import { SocketProvider } from './context/SocketContext';
import { CustomSessionProvider } from "./providers";

export const metadata: Metadata = {
  title: "Lazy-CRM",
  description:
    "A crm that wont make you explain your changes a million times to clients",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CustomSessionProvider>
          <SocketProvider>
            <ProjectProvider>
              <Appbar />
              <main className="pt-16">
                {children}
              </main>
            </ProjectProvider>
          </SocketProvider>
        </CustomSessionProvider>
      </body>
    </html>
  );
}
