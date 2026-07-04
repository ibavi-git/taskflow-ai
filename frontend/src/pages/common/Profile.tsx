import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/services/api";
import { useUpdateProfile } from "@workspace/api-client-react";

export default function Profile() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setBio(user?.bio ?? "");
  }, [user]);

  const handleSave = async () => {
    setError("");
    try {
      await updateProfile.mutateAsync({ name, bio });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your account details and bio from the existing profile endpoint.</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-primary" />Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={user?.email ?? ""} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Tell the team a bit about yourself" />
          </div>
          {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          <Button type="button" onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
