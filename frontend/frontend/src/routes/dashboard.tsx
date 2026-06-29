import { createFileRoute, Navigate, useHydrated } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, orgDataApi, type OrganizationData } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Organization Data — Org Console" },
      { name: "description", content: "Manage organization records." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const hydrated = useHydrated();
  const { isAuthenticated } = useAuth();
  if (!hydrated) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <OrgDataSection />
    </AppShell>
  );
}

function OrgDataSection() {
  const qc = useQueryClient();
  const [orgIdInput, setOrgIdInput] = useState<string>("1");
  const [activeOrgId, setActiveOrgId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OrganizationData | null>(null);

  useEffect(() => {
    // Auto-load default org on first mount.
    setActiveOrgId(1);
  }, []);

  const query = useQuery({
    queryKey: ["orgdata", activeOrgId],
    queryFn: () => orgDataApi.getAll(activeOrgId as number),
    enabled: activeOrgId !== null,
    retry: false,
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => orgDataApi.remove(id),
    onSuccess: () => {
      toast.success("Record deleted");
      qc.invalidateQueries({ queryKey: ["orgdata", activeOrgId] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Delete failed"),
  });

  function handleLoad(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(orgIdInput);
    if (!Number.isFinite(parsed)) {
      toast.error("Organization ID must be a number");
      return;
    }
    setActiveOrgId(parsed);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organization Data</h1>
          <p className="text-sm text-muted-foreground">
            Look up and manage records by organization ID.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lookup</CardTitle>
          <CardDescription>Enter an organization ID to load its records.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLoad} className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="org-id">Organization ID</Label>
              <Input
                id="org-id"
                type="number"
                value={orgIdInput}
                onChange={(e) => setOrgIdInput(e.target.value)}
                className="w-40"
              />
            </div>
            <Button type="submit" variant="secondary">Load</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {activeOrgId !== null ? `Records for org #${activeOrgId}` : "Records"}
          </CardTitle>
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
            <p className="text-sm text-muted-foreground">No records.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Org ID</TableHead>
                    <TableHead>Field 1</TableHead>
                    <TableHead>Field 2</TableHead>
                    <TableHead>Field 3</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.organization_id}</TableCell>
                      <TableCell>{row.field_1}</TableCell>
                      <TableCell>{row.field_2}</TableCell>
                      <TableCell>{row.field_3}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditing(row);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Delete record #${row.id}?`)) {
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

      <OrgDataDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        defaultOrgId={activeOrgId ?? (Number(orgIdInput) || 1)}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["orgdata", activeOrgId] });
        }}
      />
    </div>
  );
}

function OrgDataDialog({
  open,
  onOpenChange,
  editing,
  defaultOrgId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: OrganizationData | null;
  defaultOrgId: number;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<OrganizationData>({
    id: 0,
    organization_id: defaultOrgId,
    field_1: "",
    field_2: "",
    field_3: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        editing ?? {
          id: 0,
          organization_id: defaultOrgId,
          field_1: "",
          field_2: "",
          field_3: "",
        },
      );
    }
  }, [open, editing, defaultOrgId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await orgDataApi.update(editing.id, form);
        toast.success("Record updated");
      } else {
        await orgDataApi.add(form);
        toast.success("Record created");
      }
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
          <DialogTitle>{editing ? "Edit record" : "New record"}</DialogTitle>
          <DialogDescription>
            {editing ? `Update record #${editing.id}.` : "Add a new organization record."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                type="number"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: Number(e.target.value) })}
                required
                disabled={!!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org">Organization ID</Label>
              <Input
                id="org"
                type="number"
                value={form.organization_id}
                onChange={(e) =>
                  setForm({ ...form, organization_id: Number(e.target.value) })
                }
                required
              />
            </div>
          </div>
          {(["field_1", "field_2", "field_3"] as const).map((key) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{key.replace("_", " ")}</Label>
              <Input
                id={key}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
              />
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
