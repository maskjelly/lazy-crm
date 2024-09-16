"use client";

import { ProjectMaker } from "@/app/action/makeProject";
import { useState, FormEvent, useEffect } from "react";
import { getProjects } from "../action/getProject";
import { Projects } from "../components/userdata";

export default function HOME() {
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const fetchedProjects = await getProjects();
    setProjects(fetchedProjects.map(project => project.name));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await ProjectMaker(projectName);
    setProjectName("");
    fetchProjects();
  }

  return (<div>
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="border p-2 mr-2"
        />
        <button type="submit" className="border p-2 bg-blue-500 text-white">
          Create Project
        </button>
      </form>

      <Projects projectNames={projects} />
    </div></div>
  );
}
