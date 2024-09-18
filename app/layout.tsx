import type { Metadata } from "next";
import "./globals.css";
import { ProjectProvider } from "./context/ProjectContext";


export const metadata: Metadata = {
  title: "Lazy-CRM",
  description:
    "A crm that wont make you explain your changes a million times to clients",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </body>
    </html>
  );
}
