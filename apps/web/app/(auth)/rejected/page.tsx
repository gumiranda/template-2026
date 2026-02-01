"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { XCircle } from "lucide-react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { FullPageLoader } from "@/components/full-page-loader";

export default function RejectedPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { currentUser, isLoading } = useAuthRedirect({
    whenApproved: "/",
    whenPending: "/pending-approval",
    whenRejected: undefined,
    whenNoUser: undefined,
    whenNoSuperadmin: undefined,
  });

  if (isLoading) {
    return <FullPageLoader />;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Unfortunately, your access request has been rejected.
          </p>
          {currentUser?.rejectionReason && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Reason:</p>
              <p className="text-sm text-muted-foreground">
                {currentUser.rejectionReason}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            If you believe this was a mistake, please contact the system administrator.
          </p>
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
