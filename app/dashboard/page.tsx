"use client";

import { ProjectMaker } from "@/app/action/makeProject";
import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
export default function DashboardPage() {
  const session = useSession();
  const [projectName, setProjectName] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await ProjectMaker(projectName);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div>
          <input
            type="text"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <button type="submit" className="border mx-5">
            Create Project
          </button>
        </div>
      </form>
    </>
  );
}
