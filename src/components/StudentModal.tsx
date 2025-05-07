import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  students: string[];
  onAddStudent: (name: string) => void;
  onEditStudent: (index: number, name: string) => void;
  onDeleteStudent: (index: number) => void;
}

const StudentModal: React.FC<StudentModalProps> = ({
  open,
  onClose,
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
}) => {
  const { t } = useTranslation();
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [editStudentIndex, setEditStudentIndex] = useState<number | null>(null);
  const [editStudentValue, setEditStudentValue] = useState<string>("");

  const handleAddStudent = () => {
    if (newStudentName.trim() === "") return;
    onAddStudent(newStudentName.trim());
    setNewStudentName("");
  };

  const handleEditStudent = (index: number) => {
    setEditStudentIndex(index);
    setEditStudentValue(students[index]);
  };

  const handleSaveStudentEdit = () => {
    if (editStudentIndex === null || editStudentValue.trim() === "") return;
    onEditStudent(editStudentIndex, editStudentValue.trim());
    setEditStudentIndex(null);
    setEditStudentValue("");
  };

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", sm: "80%", md: 600 },
    maxWidth: "100%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: { xs: 2, sm: 4 },
    borderRadius: 2,
    maxHeight: "80vh",
    overflowY: "auto" as const,
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {t("student_list")}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Table
          sx={{
            "& th, & td": {
              padding: { xs: "4px", sm: "8px" },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>{t("name")}</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student, index) => (
              <TableRow key={index}>
                <TableCell>
                  {editStudentIndex === index ? (
                    <TextField
                      value={editStudentValue}
                      onChange={(e) => setEditStudentValue(e.target.value)}
                      size="small"
                      onBlur={handleSaveStudentEdit}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleSaveStudentEdit();
                      }}
                      autoFocus
                      sx={{ width: { xs: "100%", sm: "200px" } }}
                    />
                  ) : (
                    student
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {editStudentIndex === index ? (
                      <IconButton onClick={handleSaveStudentEdit}>
                        <SaveIcon color="success" fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleEditStudent(index)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton onClick={() => onDeleteStudent(index)}>
                      <DeleteIcon color="error" fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <TextField
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder={t("enter_student_name")}
                  size="small"
                  sx={{ width: { xs: "100%", sm: "200px" } }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleAddStudent();
                  }}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={handleAddStudent}
                  disabled={newStudentName.trim() === ""}
                >
                  <AddIcon color="primary" fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Modal>
  );
};

export default StudentModal;