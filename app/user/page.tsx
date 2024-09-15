import { getServerSession } from "next-auth";
import { Appbar } from "../components/appbar";
import { NEXT_AUTH } from "../auth/auth";

export default async function Userfunction() {
  const session = await getServerSession(NEXT_AUTH);
  return <div>
    
    <Appbar/>
    user component {JSON.stringify(session)}</div>;

}