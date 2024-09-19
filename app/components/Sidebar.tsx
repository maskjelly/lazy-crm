import Link from "next/link";
import { useProjectContext } from "@/app/context/ProjectContext";

export const Sidebar = () => {
  const { state } = useProjectContext();

  return (
    <div className="sidebar">
      <h2>Projects</h2>
      {state.projects.map(project => (
        <Link key={project.id} href={`/projects/${encodeURIComponent(project.name)}`}>
          <div className="project-link">{project.name}</div>
        </Link>
      ))}
    </div>
  );
};