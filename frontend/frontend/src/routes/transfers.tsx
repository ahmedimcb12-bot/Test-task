import { createFileRoute, Navigate, useHydrated } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, rowsApi, type Transference } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/transfers")({
  head: () => ({
    meta: [
      { title: "Transfers — Org Console" },
      { name: "description", content: "Inter-organization transfer records." },
    ],
  }),
  component: TransfersPage,
});

function TransfersPage() {
  const hydrated = useHydrated();
  const { isAuthenticated } = useAuth();
  if (!hydrated) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <TransfersSection />
    </AppShell>
  );
}

function TransfersSection() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const query = useQuery({
    queryKey: ["transfers"],
    queryFn: () => rowsApi.list(),
    retry: false,
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => rowsApi.remove(id),
    onSuccess: () => {
      toast.success("Transfer deleted");
      qc.invalidateQueries({ queryKey: ["transfers"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Delete failed"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transfers</h1>
          <p className="text-sm text-muted-foreground">
            Messages exchanged between organizations.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All transfers</CardTitle>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : query.isError ? (
            <p className="text-sm text-destructive">
              {query.error instanceof ApiError ? query.error.message : "Failed to load"}
            </p>
          ) : !query.data || query.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transfers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.sender_org_id}</TableCell>
                      <TableCell>{row.receiver_org_id}</TableCell>
                      <TableCell className="max-w-md truncate">{row.message}</TableCell>
                      <TableCell>{formatDate(row.transferred_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Delete transfer #${row.id}?`)) {
                              removeMutation.mutate(row.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TransferDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => qc.invalidateQueries({ queryKey: ["transfers"] })}
      />
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function TransferDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const empty: Transference = {
    id: 0,
    sender_org_id: 0,
    receiver_org_id: 0,
    message: "",
    transferred_at: new Date().toISOString(),
  };
  const [form, setForm] = useState<Transference>(empty);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm({ ...empty, transferred_at: new Date().toISOString() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await rowsApi.add(form);
      toast.success("Transfer created");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New transfer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="t-id">ID</Label>
              <Input
                id="t-id"
                type="number"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-when">Transferred at</Label>
              <Input
                id="t-when"
                type="datetime-local"
                value={toLocalInput(form.transferred_at)}
                onChange={(e) =>
                  setForm({ ...form, transferred_at: new Date(e.target.value).toISOString() })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-from">Sender org ID</Label>
              <Input
                id="t-from"
                type="number"
                value={form.sender_org_id}
                onChange={(e) => setForm({ ...form, sender_org_id: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-to">Receiver org ID</Label>
              <Input
                id="t-to"
                type="number"
                value={form.receiver_org_id}
                onChange={(e) => setForm({ ...form, receiver_org_id: Number(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-msg">Message</Label>
            <Textarea
              id="t-msg"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
