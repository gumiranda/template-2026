"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Clock } from "lucide-react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { FullPageLoader } from "@/components/full-page-loader";

export default function PendingApprovalPage() {
  const { isLoading } = useAuthRedirect({
    whenPending: undefined,
  });

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-accent/20 rounded-full w-fit">
            <Clock className="h-8 w-8 text-accent-foreground" />
          </div>
          <CardTitle>Awaiting Approval</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your account has been created successfully! You now need to wait for
            an administrator to approve your access to the system.
          </p>
          <p className="text-sm text-muted-foreground">
            You will receive access once your account is approved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
