import { Card } from "./ui/card";

export const DataCard = ({ Name, id ,email }: { Name: string; id: number ,email : string}) => {
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
      <div className="flex flex-col space-y-4">
        {projectNames.length === 0 ? (
          <p>No projects found</p>
        ) : (
          projectNames.map((name, index) => (
            <div key={index} className="flex justify-between border-b pb-2">
              <div>Project {index + 1}</div>
              <div>{name}</div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
