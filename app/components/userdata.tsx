import { Card } from "./ui/card";

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
    <div>
      <Card title="Projects Dashboard">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2">Project Name</th>
              </tr>
            </thead>
            <tbody>
              {projectNames.length === 0 ? (
                <tr>
                  <td className="p-2">No projects found</td>
                </tr>
              ) : (
                projectNames.map((name, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
