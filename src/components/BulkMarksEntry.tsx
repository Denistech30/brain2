import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useTranslation } from "react-i18next";
import { Subject } from "../types";

interface BulkMarksEntryProps {
  open: boolean;
  onClose: () => void;
  students: string[];
  subjects: Subject[];
  selectedSequence: string;
  onSave: (
    studentIndex: number,
    subjectName: string,
    mark: string,
    maxTotal: number
  ) => void;
}

const BulkMarksEntry: React.FC<BulkMarksEntryProps> = ({
  open,
  onClose,
  students,
  subjects,
  selectedSequence,
  onSave,
}) => {
  const { t } = useTranslation();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [marks, setMarks] = useState<(number | "")[]>([]);

  useEffect(() => {
    // Initialize marks array with empty values for each student
    setMarks(Array(students.length).fill(""));
  }, [students, open]);

  const handleMarkChange = (index: number, value: string) => {
    const newMarks = [...marks];
    const numValue = value === "" ? "" : Number(value);
    
    const subject = subjects.find(s => s.name === selectedSubject);
    const maxTotal = subject ? subject.total : 100;
    
    if (numValue === "" || (typeof numValue === "number" && numValue >= 0 && numValue <= maxTotal)) {
      newMarks[index] = numValue;
      setMarks(newMarks);
    }
  };

  const handleSaveAll = () => {
    if (!selectedSubject) return;
    
    const subject = subjects.find(s => s.name === selectedSubject);
    if (!subject) return;
    
    marks.forEach((mark, index) => {
      onSave(index, selectedSubject, mark.toString(), subject.total);
    });
    
    onClose();
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
            {t("bulk_marks_entry")} - {t(selectedSequence)}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="subject-select-label">
            {t("subject_name")}
          </InputLabel>
          <Select
            labelId="subject-select-label"
            value={selectedSubject}
            label={t("subject_name")}
            onChange={(e) => setSelectedSubject(e.target.value as string)}
            size="small"
          >
            {subjects.map((subject) => (
              <MenuItem key={subject.name} value={subject.name}>
                {subject.name} (/{subject.total})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {selectedSubject && (
          <>
            <Box sx={{ overflowX: "auto", mt: 2 }}>
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
                    <TableCell sx={{ fontWeight: "bold" }}>{t("student")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {t("mark")} (/{subjects.find(s => s.name === selectedSubject)?.total})
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell>{student}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={marks[index]}
                          onChange={(e) => handleMarkChange(index, e.target.value)}
                          inputProps={{
                            min: 0,
                            max: subjects.find(s => s.name === selectedSubject)?.total,
                            step: "0.01",
                          }}
                          sx={{ width: { xs: "80px", sm: "100px" } }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveAll}
              startIcon={<SaveIcon />}
              sx={{ mt: 2 }}
            >
              {t("save_all")}
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default BulkMarksEntry;