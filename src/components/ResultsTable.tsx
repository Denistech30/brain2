import React from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { SequenceResult, TermResult, AnnualResult } from "../types";

interface ResultsTableProps {
  selectedResultView: "sequence" | "firstTerm" | "secondTerm" | "thirdTerm" | "annual";
  onResultViewChange: (
    view: "sequence" | "firstTerm" | "secondTerm" | "thirdTerm" | "annual"
  ) => void;
  sequenceResults: SequenceResult[];
  firstTermResults: TermResult[];
  secondTermResults: TermResult[];
  thirdTermResults: TermResult[];
  annualResults: AnnualResult[];
  sequenceClassAverage: number | null;
  firstTermClassAverage: number | null;
  secondTermClassAverage: number | null;
  thirdTermClassAverage: number | null;
  annualClassAverage: number | null;
  sequencePassPercentage: number | null;
  firstTermPassPercentage: number | null;
  secondTermPassPercentage: number | null;
  thirdTermPassPercentage: number | null;
  annualPassPercentage: number | null;
  passingMark: number;
  onDownloadPDF: () => void;
  isDownloadDisabled: boolean;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  selectedResultView,
  onResultViewChange,
  sequenceResults,
  firstTermResults,
  secondTermResults,
  thirdTermResults,
  annualResults,
  sequenceClassAverage,
  firstTermClassAverage,
  secondTermClassAverage,
  thirdTermClassAverage,
  annualClassAverage,
  sequencePassPercentage,
  firstTermPassPercentage,
  secondTermPassPercentage,
  thirdTermPassPercentage,
  annualPassPercentage,
  passingMark,
  onDownloadPDF,
  isDownloadDisabled,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
      >
        {t("results")}
      </Typography>
      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel id="result-view-select-label">
          {t("result_view")}
        </InputLabel>
        <Select
          labelId="result-view-select-label"
          value={selectedResultView}
          label={t("result_view")}
          onChange={(e) =>
            onResultViewChange(
              e.target.value as
                | "sequence"
                | "firstTerm"
                | "secondTerm"
                | "thirdTerm"
                | "annual"
            )
          }
          size="small"
        >
          <MenuItem value="sequence">{t("sequence")}</MenuItem>
          <MenuItem value="firstTerm">{t("first_term")}</MenuItem>
          <MenuItem value="secondTerm">{t("second_term")}</MenuItem>
          <MenuItem value="thirdTerm">{t("third_term")}</MenuItem>
          <MenuItem value="annual">{t("annual_summary")}</MenuItem>
        </Select>
      </FormControl>
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
                  minWidth: { xs: 40, sm: 60 },
                }}
              >
                {t("rank")}
              </TableCell>
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
              {selectedResultView === "annual" ? (
                <>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 80, sm: 120 },
                    }}
                  >
                    {t("first_term_avg")}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 80, sm: 120 },
                    }}
                  >
                    {t("second_term_avg")}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 80, sm: 120 },
                    }}
                  >
                    {t("third_term_avg")}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 80, sm: 120 },
                    }}
                  >
                    {t("final_avg")}
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 80, sm: 120 },
                    }}
                  >
                    {t("total_marks")}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 80, sm: 120 },
                    }}
                  >
                    {t("average")}
                  </TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedResultView === "sequence" &&
              sequenceResults.map((result) => (
                <TableRow key={result.student}>
                  <TableCell>{result.rank}</TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      bgcolor: "white",
                      zIndex: 1,
                    }}
                  >
                    {result.student}
                  </TableCell>
                  <TableCell>{result.totalMarks.toFixed(2)}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        result.average < passingMark ? "red" : "inherit",
                    }}
                  >
                    {result.average.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            {selectedResultView === "firstTerm" &&
              firstTermResults.map((result) => (
                <TableRow key={result.student}>
                  <TableCell>{result.rank}</TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      bgcolor: "white",
                      zIndex: 1,
                    }}
                  >
                    {result.student}
                  </TableCell>
                  <TableCell>{result.totalMarks.toFixed(2)}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        result.average < passingMark ? "red" : "inherit",
                    }}
                  >
                    {result.average.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            {selectedResultView === "secondTerm" &&
              secondTermResults.map((result) => (
                <TableRow key={result.student}>
                  <TableCell>{result.rank}</TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      bgcolor: "white",
                      zIndex: 1,
                    }}
                  >
                    {result.student}
                  </TableCell>
                  <TableCell>{result.totalMarks.toFixed(2)}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        result.average < passingMark ? "red" : "inherit",
                    }}
                  >
                    {result.average.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            {selectedResultView === "thirdTerm" &&
              thirdTermResults.map((result) => (
                <TableRow key={result.student}>
                  <TableCell>{result.rank}</TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      bgcolor: "white",
                      zIndex: 1,
                    }}
                  >
                    {result.student}
                  </TableCell>
                  <TableCell>{result.totalMarks.toFixed(2)}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        result.average < passingMark ? "red" : "inherit",
                    }}
                  >
                    {result.average.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            {selectedResultView === "annual" &&
              annualResults.map((result) => (
                <TableRow key={result.student}>
                  <TableCell>{result.rank}</TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      bgcolor: "white",
                      zIndex: 1,
                    }}
                  >
                    {result.student}
                  </TableCell>
                  <TableCell>{result.firstTermAverage.toFixed(2)}</TableCell>
                  <TableCell>{result.secondTermAverage.toFixed(2)}</TableCell>
                  <TableCell>{result.thirdTermAverage.toFixed(2)}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        result.finalAverage < passingMark
                          ? "red"
                          : "inherit",
                    }}
                  >
                    {result.finalAverage.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Box>
      <Typography
        variant="body1"
        sx={{ mt: 2, fontSize: { xs: "0.75rem", sm: "1rem" } }}
      >
        {t("class_average", {
          value:
            selectedResultView === "sequence"
              ? sequenceClassAverage?.toFixed(2)
              : selectedResultView === "firstTerm"
              ? firstTermClassAverage?.toFixed(2)
              : selectedResultView === "secondTerm"
              ? secondTermClassAverage?.toFixed(2)
              : selectedResultView === "thirdTerm"
              ? thirdTermClassAverage?.toFixed(2)
              : annualClassAverage?.toFixed(2),
        })}
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontSize: { xs: "0.75rem", sm: "1rem" } }}
      >
        {t("pass_percentage", {
          value:
            selectedResultView === "sequence"
              ? sequencePassPercentage?.toFixed(2)
              : selectedResultView === "firstTerm"
              ? firstTermPassPercentage?.toFixed(2)
              : selectedResultView === "secondTerm"
              ? secondTermPassPercentage?.toFixed(2)
              : selectedResultView === "thirdTerm"
              ? thirdTermPassPercentage?.toFixed(2)
              : annualPassPercentage?.toFixed(2),
        })}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={onDownloadPDF}
        sx={{ mt: 2, minWidth: { xs: 100, sm: 120 } }}
        disabled={isDownloadDisabled}
      >
        {t("download_pdf")}
      </Button>
    </>
  );
};

export default ResultsTable;