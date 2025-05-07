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
import { Subject } from "../types";

interface SubjectModalProps {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddSubject: (name: string, total: number) => void;
  onEditSubject: (index: number, name: string, total: number) => void;
  onDeleteSubject: (index: number) => void;
}

const SubjectModal: React.FC<SubjectModalProps> = ({
  open,
  onClose,
  subjects,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}) => {
  const { t } = useTranslation();
  const [newSubjectName, setNewSubjectName] = useState<string>("");
  const [newSubjectTotal, setNewSubjectTotal] = useState<string>("");
  const [editSubjectIndex, setEditSubjectIndex] = useState<number | null>(null);
  const [editSubjectValue, setEditSubjectValue] = useState<Subject>({
    name: "",
    total: 0,
  });

  const handleAddSubject = () => {
    const total = parseInt(newSubjectTotal, 10);
    if (newSubjectName.trim() === "" || isNaN(total) || total <= 0) return;
    onAddSubject(newSubjectName.trim(), total);
    setNewSubjectName("");
    setNewSubjectTotal("");
  };

  const handleEditSubject = (index: number) => {
    setEditSubjectIndex(index);
    setEditSubjectValue(subjects[index]);
  };

  const handleSaveSubjectEdit = () => {
    if (
      editSubjectIndex === null ||
      editSubjectValue.name.trim() === "" ||
      editSubjectValue.total <= 0
    )
      return;
    onEditSubject(
      editSubjectIndex,
      editSubjectValue.name.trim(),
      editSubjectValue.total
    );
    setEditSubjectIndex(null);
    setEditSubjectValue({ name: "", total: 0 });
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
            {t("subject_list")}
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
              <TableCell sx={{ fontWeight: "bold" }}>
                {t("subject_name")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                {t("total_score")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((subject, index) => (
              <TableRow key={index}>
                <TableCell>
                  {editSubjectIndex === index ? (
                    <TextField
                      value={editSubjectValue.name}
                      onChange={(e) =>
                        setEditSubjectValue({
                          ...editSubjectValue,
                          name: e.target.value,
                        })
                      }
                      size="small"
                      autoFocus
                      sx={{ width: { xs: "100%", sm: "150px" } }}
                    />
                  ) : (
                    subject.name
                  )}
                </TableCell>
                <TableCell>
                  {editSubjectIndex === index ? (
                    <TextField
                      type="number"
                      value={editSubjectValue.total}
                      onChange={(e) =>
                        setEditSubjectValue({
                          ...editSubjectValue,
                          total: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      size="small"
                      inputProps={{ min: 0 }}
                      sx={{ width: { xs: "60px", sm: "80px" } }}
                    />
                  ) : (
                    subject.total
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {editSubjectIndex === index ? (
                      <IconButton onClick={handleSaveSubjectEdit}>
                        <SaveIcon color="success" fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleEditSubject(index)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton onClick={() => onDeleteSubject(index)}>
                      <DeleteIcon color="error" fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <TextField
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder={t("enter_subject_name")}
                  size="small"
                  sx={{ width: { xs: "100%", sm: "150px" } }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && newSubjectTotal.trim() !== "") handleAddSubject();
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={newSubjectTotal}
                  onChange={(e) => setNewSubjectTotal(e.target.value)}
                  placeholder={t("total")}
                  size="small"
                  inputProps={{ min: 0 }}
                  sx={{ width: { xs: "60px", sm: "80px" } }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && newSubjectName.trim() !== "") handleAddSubject();
                  }}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={handleAddSubject}
                  disabled={
                    newSubjectName.trim() === "" ||
                    newSubjectTotal.trim() === "" ||
                    parseInt(newSubjectTotal, 10) <= 0
                  }
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

export default SubjectModal;