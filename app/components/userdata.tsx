import { Card } from "./ui/card";
import { motion } from "framer-motion";

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
export const Projects = ({ projectNames }: { projectNames: string[] }) => {
  return (
    <Card title="Projects Dashboard">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2 border-b border-accent">Project Name</th>
            </tr>
          </thead>
          <tbody>
            {projectNames.length === 0 ? (
              <tr>
                <td className="p-2 text-accent">No projects found</td>
              </tr>
            ) : (
              projectNames.map((name, index) => (
                <motion.tr 
                  key={index} 
                  className="border-b border-accent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <td className="p-2">{name}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
