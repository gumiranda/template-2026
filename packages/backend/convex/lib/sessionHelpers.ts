import { SessionStatus, type SessionStatusType } from "./types";

interface SessionWithStatus {
  status?: SessionStatusType;
}

export function assertSessionNotClosed(
  session: SessionWithStatus,
  operation: string = "perform this action"
): void {
  if (session.status === SessionStatus.CLOSED) {
    throw new Error(`Cannot ${operation}: session is already closed`);
  }
}

export function assertSessionCanAcceptChanges(
  session: SessionWithStatus,
  operation: string = "add items"
): void {
  assertSessionNotClosed(session, operation);

  if (session.status === SessionStatus.REQUESTING_CLOSURE) {
    throw new Error(`Cannot ${operation}: bill closure is pending`);
  }
}
