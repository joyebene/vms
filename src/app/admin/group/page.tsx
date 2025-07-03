import GroupCreator from "@/components/GroupCreate";
import GroupMapper from "@/components/GroupMapper";

export default function AdminGroupPage() {
  return (
    <div>
      <h1>Group Management</h1>
      <GroupCreator />
      <hr />
      <GroupMapper />
    </div>
  );
}
