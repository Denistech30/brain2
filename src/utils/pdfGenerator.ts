import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { StudentMarks, Subject, SequenceResult, TermResult, AnnualResult } from "../types";

export const generateStudentReport = (
  student: string,
  studentIndex: number,
  studentMarks: StudentMarks,
  subjects: Subject[],
  studentComments: {
    [studentIndex: number]: { [sequence: string]: string };
  },
  selectedSequence: keyof StudentMarks,
  selectedResultView: "sequence" | "firstTerm" | "secondTerm" | "thirdTerm" | "annual",
  firstTermResults: TermResult[],
  secondTermResults: TermResult[],
  thirdTermResults: TermResult[],
  annualResults: AnnualResult[],
  t: (key: string, options?: any) => string
) => {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString();

  // Add BrainBoard header
  doc.setFontSize(20);
  doc.setTextColor(25, 118, 210); // blue color #1976d2
  doc.text("Brain", 20, 15);
  doc.setTextColor(46, 125, 50); // green color #2e7d32
  doc.text("Board", 47, 15);

  // Add date
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128); // gray color
  doc.text(`Generated on: ${currentDate}`, 20, 25);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.text(`${t("student_reports")}: ${student}`, 20, 35);

  const tableData: string[][] = [];

  if (selectedResultView === "sequence") {
    // Only show marks for selected sequence
    subjects.forEach((subject) => {
      const mark = studentMarks[selectedSequence][subject.name] ?? "-";
      const comment = studentComments[studentIndex]?.[selectedSequence] || t("no_comment");
      tableData.push([
        subject.name,
        mark.toString(),
        comment,
      ]);
    });

    autoTable(doc, {
      startY: 45,
      head: [[t("subject_name"), t("mark"), t("teacher_comment")]],
      body: tableData,
    });
  } else {
    // Show term or annual results
    let result;
    let columns;
    
    if (selectedResultView === "firstTerm") {
      result = firstTermResults.find((r) => r.student === student);
      columns = [[t("total_marks"), t("average"), t("rank")]];
      if (result) {
        tableData.push([
          result.totalMarks.toFixed(2),
          result.average.toFixed(2),
          result.rank.toString()
        ]);
      }
    } else if (selectedResultView === "secondTerm") {
      result = secondTermResults.find((r) => r.student === student);
      columns = [[t("total_marks"), t("average"), t("rank")]];
      if (result) {
        tableData.push([
          result.totalMarks.toFixed(2),
          result.average.toFixed(2),
          result.rank.toString()
        ]);
      }
    } else if (selectedResultView === "thirdTerm") {
      result = thirdTermResults.find((r) => r.student === student);
      columns = [[t("total_marks"), t("average"), t("rank")]];
      if (result) {
        tableData.push([
          result.totalMarks.toFixed(2),
          result.average.toFixed(2),
          result.rank.toString()
        ]);
      }
    } else if (selectedResultView === "annual") {
      result = annualResults.find((r) => r.student === student);
      columns = [[t("first_term_avg"), t("second_term_avg"), t("third_term_avg"), t("final_avg"), t("rank")]];
      if (result) {
        tableData.push([
          result.firstTermAverage.toFixed(2),
          result.secondTermAverage.toFixed(2),
          result.thirdTermAverage.toFixed(2),
          result.finalAverage.toFixed(2),
          result.rank.toString()
        ]);
      }
    }

    if (tableData.length > 0) {
      autoTable(doc, {
        startY: 45,
        head: columns,
        body: tableData,
      });
    }
  }

  const finalY = (doc as any).lastAutoTable.finalY || 45;
  const comment = studentComments[studentIndex]?.[selectedSequence] || t("no_comment");
  
  doc.setFontSize(12);
  doc.text(t("teacher_comment"), 20, finalY + 10);
  doc.text(comment, 20, finalY + 20);

  doc.save(`${student}_${selectedResultView}_report.pdf`);
};

export const generateResultsPDF = (
  title: string,
  results: SequenceResult[] | TermResult[] | AnnualResult[],
  classAvg: number,
  passPerc: number,
  isAnnual: boolean,
  t: (key: string, options?: any) => string
) => {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString();
  
  // Add BrainBoard header
  doc.setFontSize(20);
  doc.setTextColor(25, 118, 210); // blue color #1976d2
  doc.text("Brain", 20, 15);
  doc.setTextColor(46, 125, 50); // green color #2e7d32
  doc.text("Board", 47, 15);

  // Add date
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128); // gray color
  doc.text(`Generated on: ${currentDate}`, 20, 25);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.text(`${title}`, 20, 35);
  
  const tableHead = isAnnual
    ? [
        [
          t("rank"),
          t("student"),
          t("first_term_avg"),
          t("second_term_avg"),
          t("third_term_avg"),
          t("final_avg"),
        ],
      ]
    : [[t("rank"), t("student"), t("total_marks"), t("average")]];
  
  const tableData = isAnnual
    ? (results as AnnualResult[]).map((result) => [
        result.rank.toString(),
        result.student,
        result.firstTermAverage.toFixed(2),
        result.secondTermAverage.toFixed(2),
        result.thirdTermAverage.toFixed(2),
        result.finalAverage.toFixed(2),
      ])
    : (results as (SequenceResult | TermResult)[]).map((result) => [
        result.rank.toString(),
        result.student,
        result.totalMarks.toFixed(2),
        result.average.toFixed(2),
      ]);

  autoTable(doc, {
    startY: 45,
    head: tableHead,
    body: tableData,
  });

  const finalY = (doc as any).lastAutoTable.finalY || 45;
  doc.text(t("class_average", { value: classAvg.toFixed(2) }), 20, finalY + 10);
  doc.text(
    t("pass_percentage", { value: passPerc.toFixed(2) }),
    20,
    finalY + 20
  );

  doc.save(`${title.toLowerCase().replace(" ", "-")}.pdf`);
};