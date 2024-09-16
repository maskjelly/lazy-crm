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
