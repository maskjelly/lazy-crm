import { Card } from "./ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

export const DataCard = ({
  Name,
  id,
  email,
}: {
  Name: string;
  id: number;
  email: string;
}) => {
  return (
    <Card title={"Dashboard"}>
      <div className="flex justify-between border-b pb-2">
        <div>User Name</div>
        <div>{Name}</div>
      </div>
      <div className="flex justify-between border-b pb-2">
        <div>User email</div>
        <div>{email}</div>
      </div>
      <div className="flex justify-between border-b py-2">
        <div>user id</div>
        <div>{id}</div>
      </div>
    </Card>
  );
};

interface ProjectInfo {
  name: string;
  taskCounts: {
    done: number;
    working: number;
    upcoming: number;
  };
}

export const Projects = ({ 
  projects
}: { 
  projects: ProjectInfo[]
}) => {
  return (
    <Card title="Projects Dashboard">
      <div className="grid grid-cols-1 gap-4">
        {projects.length === 0 ? (
          <p className="text-accent">No projects found</p>
        ) : (
          projects.map((project, index) => (
            <Link key={index} href={`/projects/${encodeURIComponent(project.name)}`}>
              <motion.div 
                className="border border-accent rounded-lg p-3 md:p-4 hover:bg-accent hover:bg-opacity-10 cursor-pointer transition-colors duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <h3 className="text-base md:text-lg font-semibold mb-2">{project.name}</h3>
                <div className="flex flex-col text-xs md:text-sm">
                  <span className="text-green-500">Done: {project.taskCounts.done}</span>
                  <span className="text-yellow-500">Working: {project.taskCounts.working}</span>
                  <span className="text-red-500">Upcoming: {project.taskCounts.upcoming}</span>
                </div>
              </motion.div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
};
