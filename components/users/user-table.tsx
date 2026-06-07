"use client";

import { useMemo, useState, useTransition } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { toggleDisabledAction } from "@/features/users/actions";

import type { SerializedUser, UserRole } from "@/features/users/types";

import { RoleBadge } from "./role-badge";
import { UserModal } from "./user-modal";

interface UserTableProps {
  initialUsers: SerializedUser[];
}

export function UserTable({ initialUsers }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

  const [showModal, setShowModal] = useState(false);

  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const [editingUser, setEditingUser] = useState<SerializedUser | null>(null);

  const [actionError, setActionError] = useState("");

  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  function openCreate() {
    setModalMode("create");
    setEditingUser(null);
    setShowModal(true);
  }

  function openEdit(user: SerializedUser) {
    setModalMode("edit");
    setEditingUser(user);
    setShowModal(true);
  }

  function handleModalSuccess() {
    window.location.reload();
  }

  function handleToggleDisabled(user: SerializedUser) {
    setActionError("");

    startTransition(async () => {
      const result = await toggleDisabledAction(user.id, !user.disabled);

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                disabled: !u.disabled,
              }
            : u,
        ),
      );
    });
  }

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "User",
      flex: 1.6,

      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ height: "100%", alignItems: "center" }}
        >
          <Avatar
            sx={{
              bgcolor: params.row.disabled ? "grey.400" : "primary.main",
            }}
          >
            {params.row.name[0]}
          </Avatar>

          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
              }}
            >
              {params.row.name}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {params.row.id.slice(0, 8)}
            </Typography>
          </Box>
        </Stack>
      ),
    },

    {
      field: "email",
      headerName: "Email",
      flex: 1.6,
    },

    {
      field: "role",
      headerName: "Role",
      flex: 1,

      renderCell: (params) => <RoleBadge role={params.value} />,
    },

    {
      field: "status",
      headerName: "Status",
      flex: 1,

      renderCell: (params) => (
        <RoleBadge
          role={params.row.disabled ? "STOCK_USER" : params.row.role}
        />
      ),
    },

    {
      field: "createdAt",
      headerName: "Joined",
      flex: 1,

      valueGetter: (value) =>
        new Date(value).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },

    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      flex: 1.6,

      renderCell: (params) => {
        const user = params.row as SerializedUser;

        return (
          <Stack direction="row" spacing={1} sx={{ py: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={() => openEdit(user)}
            >
              Edit
            </Button>

            <Button
              size="small"
              variant="outlined"
              color={user.disabled ? "success" : "error"}
              startIcon={
                user.disabled ? (
                  <CheckCircleOutlineOutlinedIcon />
                ) : (
                  <BlockOutlinedIcon />
                )
              }
              disabled={isPending}
              onClick={() => handleToggleDisabled(user)}
            >
              {user.disabled ? "Enable" : "Disable"}
            </Button>
          </Stack>
        );
      },
    },
  ];

  return (
    <>
      {showModal && (
        <UserModal
          mode={modalMode}
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              height: "100%",
            }}
          >
            <TextField
              size="small"
              label="Search Users"
              placeholder="Name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                minWidth: 280,
              }}
            />

            <ToggleButtonGroup
              size="small"
              exclusive
              value={roleFilter}
              onChange={(_, value) => {
                if (value) {
                  setRoleFilter(value);
                }
              }}
            >
              <ToggleButton value="ALL">All</ToggleButton>

              <ToggleButton value="OWNER">Owner</ToggleButton>

              <ToggleButton value="STOCK_MANAGER">Manager</ToggleButton>

              <ToggleButton value="STOCK_USER">User</ToggleButton>
            </ToggleButtonGroup>

            <Box />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
            >
              Create User
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          autoHeight
        />
      </Card>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block" }}
      >
        Showing {filtered.length} of {users.length} users
      </Typography>
    </>
  );
}
