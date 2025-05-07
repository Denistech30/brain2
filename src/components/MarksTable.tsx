import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Subject, StudentMarks } from "../types";

interface MarksTableProps {
  students: string[];
  subjects: Subject[];
  marks: StudentMarks[];
  selectedSequence: keyof StudentMarks;
  studentComments: {
    [studentIndex: number]: { [sequence: string]: string };
  };
  onMarkChange: (
    studentIndex: number,
    subject: string,
    value: string,
    maxTotal: number
  ) => void;
  onCommentChange: (
    studentIndex: number,
    sequence: string,
    comment: string
  ) => void;
}

const MarksTable: React.FC<MarksTableProps> = ({
  students,
  subjects,
  marks,
  selectedSequence,
  studentComments,
  onMarkChange,
  onCommentChange,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table
        sx={{
          bgcolor: "white",
          borderCollapse: "separate",
          borderSpacing: 0,
          "& th, & td": {
            borderBottom: "1px solid #e0e0e0",
            padding: { xs: "4px", sm: "8px" },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: "bold",
                minWidth: { xs: 100, sm: 150 },
                position: "sticky",
                left: 0,
                bgcolor: "white",
                zIndex: 1,
              }}
            >
              {t("student")}
            </TableCell>
            {subjects.map((subject) => (
              <TableCell
                key={subject.name}
                sx={{
                  fontWeight: "bold",
                  minWidth: { xs: 80, sm: 120 },
                }}
              >
                {subject.name} (/{subject.total})
              </TableCell>
            ))}
            <TableCell
              sx={{
                fontWeight: "bold",
                minWidth: { xs: 150, sm: 200 },
              }}
            >
              {t("comment")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student, studentIndex) => (
            <TableRow key={student}>
              <TableCell
                sx={{
                  verticalAlign: "middle",
                  position: "sticky",
                  left: 0,
                  bgcolor: "white",
                  zIndex: 1,
                }}
              >
                {student}
              </TableCell>
              {subjects.map((subject) => {
                const mark =
                  marks[studentIndex]?.[selectedSequence]?.[subject.name] ?? "";
                const markValue = typeof mark === "number" ? mark : 0;
                const isBelowAverage = markValue < subject.total / 2;
                return (
                  <TableCell key={subject.name}>
                    <TextField
                      type="number"
                      size="small"
                      value={mark}
                      onChange={(e) =>
                        onMarkChange(
                          studentIndex,
                          subject.name,
                          e.target.value,
                          subject.total
                        )
                      }
                      inputProps={{
                        min: 0,
                        max: subject.total,
                        step: "0.01",
                      }}
                      sx={{
                        width: { xs: "50px", sm: "80px" },
                        "& .MuiInputBase-input": {
                          color: isBelowAverage ? "red" : "inherit",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: isBelowAverage ? "red" : "inherit",
                          },
                          "&:hover fieldset": {
                            borderColor: isBelowAverage ? "red" : "inherit",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: isBelowAverage
                              ? "red"
                              : "primary.main",
                          },
                        },
                      }}
                    />
                  </TableCell>
                );
              })}
              <TableCell>
                <TextField
                  size="small"
                  value={
                    studentComments[studentIndex]?.[selectedSequence] || ""
                  }
                  onChange={(e) =>
                    onCommentChange(
                      studentIndex,
                      selectedSequence,
                      e.target.value
                    )
                  }
                  placeholder={t("enter_comment")}
                  sx={{ width: { xs: "120px", sm: "180px" } }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default MarksTable;