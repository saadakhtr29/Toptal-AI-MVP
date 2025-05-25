import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";

const roles = [
  { id: "sales", title: "Sales Representative" },
  { id: "react", title: "React Developer" },
  { id: "nurse", title: "Nurse" },
  { id: "marketing", title: "Marketing Manager" },
  { id: "product", title: "Product Manager" },
];

const RoleSelector = ({ selectedRole, onRoleChange }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Select Interview Role
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="role-select-label">Role</InputLabel>
        <Select
          labelId="role-select-label"
          id="role-select"
          value={selectedRole}
          label="Role"
          onChange={(e) => onRoleChange(e.target.value)}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default RoleSelector;
