import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Alert,
} from '@mui/material';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { Student, Subject, Mark, StudentMarks, SequenceResult, TermResult, AnnualResult } from './types';
import StudentModal from './components/StudentModal';
import SubjectModal from './components/SubjectModal';
import MarksTable from './components/MarksTable';
import ResultsTable from './components/ResultsTable';
import ReportModal from './components/ReportModal';
import BulkMarksEntry from './components/BulkMarksEntry';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import { generateStudentReport, generateResultsPDF } from './utils/pdfGenerator';

function App() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [bulkMarksModalOpen, setBulkMarksModalOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<keyof StudentMarks>('firstSequence');
  const [selectedResultView, setSelectedResultView] = useState<'sequence' | 'firstTerm' | 'secondTerm' | 'thirdTerm' | 'annual'>('sequence');
  const [studentComments, setStudentComments] = useState<{ [key: string]: { [key: string]: string } }>({});
  const [errorMessage, setErrorMessage] = useState('');

  // Results state
  const [sequenceResults, setSequenceResults] = useState<SequenceResult[]>([]);
  const [firstTermResults, setFirstTermResults] = useState<TermResult[]>([]);
  const [secondTermResults, setSecondTermResults] = useState<TermResult[]>([]);
  const [thirdTermResults, setThirdTermResults] = useState<TermResult[]>([]);
  const [annualResults, setAnnualResults] = useState<AnnualResult[]>([]);

  // Statistics state
  const [sequenceClassAverage, setSequenceClassAverage] = useState<number | null>(null);
  const [firstTermClassAverage, setFirstTermClassAverage] = useState<number | null>(null);
  const [secondTermClassAverage, setSecondTermClassAverage] = useState<number | null>(null);
  const [thirdTermClassAverage, setThirdTermClassAverage] = useState<number | null>(null);
  const [annualClassAverage, setAnnualClassAverage] = useState<number | null>(null);
  const [sequencePassPercentage, setSequencePassPercentage] = useState<number | null>(null);
  const [firstTermPassPercentage, setFirstTermPassPercentage] = useState<number | null>(null);
  const [secondTermPassPercentage, setSecondTermPassPercentage] = useState<number | null>(null);
  const [thirdTermPassPercentage, setThirdTermPassPercentage] = useState<number | null>(null);
  const [annualPassPercentage, setAnnualPassPercentage] = useState<number | null>(null);

  const PASSING_MARK = 10;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch students
          const studentsSnapshot = await getDocs(collection(db, `users/${user.uid}/students`));
          const studentsData = studentsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
          })) as Student[];
          setStudents(studentsData);

          // Fetch subjects
          const subjectsSnapshot = await getDocs(collection(db, `users/${user.uid}/subjects`));
          const subjectsData = subjectsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            total: doc.data().total,
          })) as Subject[];
          setSubjects(subjectsData);

          // Fetch marks
          const marksSnapshot = await getDocs(collection(db, `users/${user.uid}/marks`));
          const marksData = marksSnapshot.docs.map(doc => ({
            id: doc.id,
            studentId: doc.data().studentId,
            subjectId: doc.data().subjectId,
            sequence: doc.data().sequence,
            marks: doc.data().marks,
          })) as Mark[];
          setMarks(marksData);

          // Fetch comments
          const commentsSnapshot = await getDocs(collection(db, `users/${user.uid}/comments`));
          const commentsData = commentsSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data() as { [key: string]: string };
            return acc;
          }, {} as { [key: string]: { [key: string]: string } });
          setStudentComments(commentsData);
        } catch (err: any) {
          setErrorMessage(t('error_fetching_data') + ': ' + err.message);
        }
      }
    };
    fetchData();
  }, [user, t]);

  // Student handlers
  const handleAddStudent = async (name: string) => {
    if (user) {
      try {
        const docRef = await addDoc(collection(db, `users/${user.uid}/students`), { name });
        setStudents([...students, { id: docRef.id, name }]);
      } catch (err: any) {
        setErrorMessage(t('error_adding_student') + ': ' + err.message);
      }
    }
  };

  const handleEditStudent = async (id: string, name: string) => {
    if (user) {
      try {
        await updateDoc(doc(db, `users/${user.uid}/students`, id), { name });
        setStudents(students.map(s => (s.id === id ? { ...s, name } : s)));
      } catch (err: any) {
        setErrorMessage(t('error_editing_student') + ': ' + err.message);
      }
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/students`, id));
        setStudents(students.filter(s => s.id !== id));
        const updatedMarks = marks.filter(m => m.studentId !== id);
        setMarks(updatedMarks);
        const updatedComments = { ...studentComments };
        delete updatedComments[id];
        setStudentComments(updatedComments);
      } catch (err: any) {
        setErrorMessage(t('error_deleting_student') + ': ' + err.message);
      }
    }
  };

  // Subject handlers
  const handleAddSubject = async (name: string, total: number) => {
    if (user) {
      try {
        const docRef = await addDoc(collection(db, `users/${user.uid}/subjects`), { name, total });
        setSubjects([...subjects, { id: docRef.id, name, total }]);
      } catch (err: any) {
        setErrorMessage(t('error_adding_subject') + ': ' + err.message);
      }
    }
  };

  const handleEditSubject = async (id: string, name: string, total: number) => {
    if (user) {
      try {
        await updateDoc(doc(db, `users/${user.uid}/subjects`, id), { name, total });
        setSubjects(subjects.map(s => (s.id === id ? { ...s, name, total } : s)));
      } catch (err: any) {
        setErrorMessage(t('error_editing_subject') + ': ' + err.message);
      }
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/subjects`, id));
        setSubjects(subjects.filter(s => s.id !== id));
        const updatedMarks = marks.filter(m => m.subjectId !== id);
        setMarks(updatedMarks);
      } catch (err: any) {
        setErrorMessage(t('error_deleting_subject') + ': ' + err.message);
      }
    }
  };

  // Mark handlers
  const handleMarkChange = async (
    studentId: string,
    subjectId: string,
    mark: string,
    maxTotal: number
  ) => {
    const numericMark = mark === '' ? '' : Number(mark);
    if (
      mark === '' ||
      (typeof numericMark === 'number' && !isNaN(numericMark) && numericMark >= 0 && numericMark <= maxTotal)
    ) {
      if (user) {
        try {
          const existingMark = marks.find(
            m => m.studentId === studentId && m.subjectId === subjectId && m.sequence === selectedSequence
          );
          if (existingMark) {
            await updateDoc(doc(db, `users/${user.uid}/marks`, existingMark.id), {
              marks: numericMark,
            });
            setMarks(marks.map(m =>
              m.id === existingMark.id ? { ...m, marks: numericMark } : m
            ));
          } else if (numericMark !== '') {
            const docRef = await addDoc(collection(db, `users/${user.uid}/marks`), {
              studentId,
              subjectId,
              sequence: selectedSequence,
              marks: numericMark,
            });
            setMarks([...marks, { id: docRef.id, studentId, subjectId, sequence: selectedSequence, marks: numericMark }]);
          }
        } catch (err: any) {
          setErrorMessage(t('error_saving_marks') + ': ' + err.message);
        }
      }
    }
  };

  // Comment handler
  const handleCommentChange = async (studentId: string, sequence: string, comment: string) => {
    if (user) {
      try {
        await setDoc(
          doc(db, `users/${user.uid}/comments`, studentId),
          {
            ...studentComments[studentId],
            [sequence]: comment,
          },
          { merge: true }
        );
        setStudentComments(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [sequence]: comment,
          },
        }));
      } catch (err: any) {
        setErrorMessage(t('error_saving_comment') + ': ' + err.message);
      }
    }
  };

  // Calculate sequence results
  const calculateSequenceResults = () => {
    const results = students.map(student => {
      let totalMarks = 0;
      let totalPossible = 0;

      subjects.forEach(subject => {
        const mark = marks.find(
          m => m.studentId === student.id && m.subjectId === subject.id && m.sequence === selectedSequence
        )?.marks || 0;
        totalMarks += Number(mark);
        totalPossible += subject.total;
      });

      const average = totalPossible > 0 ? (totalMarks / totalPossible) * 20 : 0;
      return { student: student.name, totalMarks, average };
    });

    const sortedResults = [...results].sort((a, b) => b.average - a.average);
    const resultsWithRank = sortedResults.map((result, idx) => ({
      ...result,
      rank: idx + 1,
    }));

    const classAvg = results.reduce((sum, { average }) => sum + average, 0) / results.length || 0;
    const passCount = results.filter(({ average }) => average >= PASSING_MARK).length;
    const passPerc = results.length > 0 ? (passCount / results.length) * 100 : 0;

    setSequenceResults(resultsWithRank);
    setSequenceClassAverage(classAvg);
    setSequencePassPercentage(passPerc);
    setSelectedResultView('sequence');
  };

  // Calculate term results
  const calculateTermResults = () => {
    const termSequences: { [key: string]: (keyof StudentMarks)[] } = {
      firstTerm: ['firstSequence', 'secondSequence'],
      secondTerm: ['thirdSequence', 'fourthSequence'],
      thirdTerm: ['fifthSequence', 'sixthSequence'],
    };

    const calculateTerm = (term: string, sequences: (keyof StudentMarks)[]): TermResult[] => {
      const results = students.map(student => {
        let totalMarks = 0;
        let totalPossible = 0;
        let sequenceCount = 0;

        sequences.forEach(sequence => {
          let sequenceMarks = 0;
          let sequencePossible = 0;

          subjects.forEach(subject => {
            const mark = marks.find(
              m => m.studentId === student.id && m.subjectId === subject.id && m.sequence === sequence
            )?.marks || 0;
            sequenceMarks += Number(mark);
            sequencePossible += subject.total;
          });

          if (sequenceMarks > 0) {
            totalMarks += sequenceMarks;
            totalPossible += sequencePossible;
            sequenceCount++;
          }
        });

        const average = sequenceCount > 0 ? (totalMarks / totalPossible) * 20 : 0;
        return { student: student.name, totalMarks, average, rank: 0 };
      });

      const sortedResults = [...results].sort((a, b) => b.average - a.average);
      return sortedResults.map((result, idx) => ({
        ...result,
        rank: idx + 1,
      }));
    };

    const firstTermResults = calculateTerm('firstTerm', termSequences.firstTerm);
    const secondTermResults = calculateTerm('secondTerm', termSequences.secondTerm);
    const thirdTermResults = calculateTerm('thirdTerm', termSequences.thirdTerm);

    const annualResults = students.map(student => {
      const firstTermResult = firstTermResults.find(r => r.student === student.name)?.average || 0;
      const secondTermResult = secondTermResults.find(r => r.student === student.name)?.average || 0;
      const thirdTermResult = thirdTermResults.find(r => r.student === student.name)?.average || 0;

      const validTerms = [firstTermResult, secondTermResult, thirdTermResult].filter(avg => avg > 0);
      const finalAverage = validTerms.length > 0 ? validTerms.reduce((sum, avg) => sum + avg, 0) / validTerms.length : 0;

      return {
        student: student.name,
        firstTermAverage: firstTermResult,
        secondTermAverage: secondTermResult,
        thirdTermAverage: thirdTermResult,
        finalAverage,
        rank: 0,
      };
    });

    const sortedAnnualResults = [...annualResults].sort((a, b) => b.finalAverage - a.finalAverage);
    const annualResultsWithRank = sortedAnnualResults.map((result, idx) => ({
      ...result,
      rank: idx + 1,
    }));

    const calculateStats = (results: TermResult[] | AnnualResult[], isAnnual: boolean) => {
      const averages = isAnnual
        ? (results as AnnualResult[]).map(r => r.finalAverage)
        : (results as TermResult[]).map(r => r.average);
      const validAverages = averages.filter(avg => avg > 0);
      const classAvg = validAverages.length > 0 ? validAverages.reduce((sum, avg) => sum + avg, 0) / validAverages.length : 0;
      const passCount = validAverages.filter(avg => avg >= PASSING_MARK).length;
      const passPerc = validAverages.length > 0 ? (passCount / validAverages.length) * 100 : 0;
      return { classAvg, passPerc };
    };

    const firstTermStats = calculateStats(firstTermResults, false);
    const secondTermStats = calculateStats(secondTermResults, false);
    const thirdTermStats = calculateStats(thirdTermResults, false);
    const annualStats = calculateStats(annualResultsWithRank, true);

    setFirstTermResults(firstTermResults);
    setSecondTermResults(secondTermResults);
    setThirdTermResults(thirdTermResults);
    setAnnualResults(annualResultsWithRank);

    setFirstTermClassAverage(firstTermStats.classAvg);
    setSecondTermClassAverage(secondTermStats.classAvg);
    setThirdTermClassAverage(thirdTermStats.classAvg);
    setAnnualClassAverage(annualStats.classAvg);

    setFirstTermPassPercentage(firstTermStats.passPerc);
    setSecondTermPassPercentage(secondTermStats.passPerc);
    setThirdTermPassPercentage(thirdTermStats.passPerc);
    setAnnualPassPercentage(annualStats.passPerc);

    setSelectedResultView('firstTerm');
  };

  // Generate reports
  const handleGenerateStudentReport = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const studentMarks: StudentMarks = {
        firstSequence: {},
        secondSequence: {},
        thirdSequence: {},
        fourthSequence: {},
        fifthSequence: {},
        sixthSequence: {},
      };
      marks.forEach(m => {
        if (m.studentId === studentId) {
          const subject = subjects.find(s => s.id === m.subjectId);
          if (subject) {
            studentMarks[m.sequence][subject.name] = m.marks;
          }
        }
      });
      generateStudentReport(
        student.name,
        studentId,
        studentMarks,
        subjects,
        studentComments[studentId] || {},
        selectedSequence,
        selectedResultView,
        firstTermResults,
        secondTermResults,
        thirdTermResults,
        annualResults,
        t
      );
    }
  };

  const handleGenerateAllReports = () => {
    students.forEach(student => handleGenerateStudentReport(student.id));
  };

  // Reset data
  const handleResetData = async () => {
    if (user && window.confirm(t('confirm_reset'))) {
      try {
        const collections = ['students', 'subjects', 'marks', 'comments'];
        for (const col of collections) {
          const snapshot = await getDocs(collection(db, `users/${user.uid}/${col}`));
          for (const d of snapshot.docs) {
            await deleteDoc(doc(db, `users/${user.uid}/${col}`, d.id));
          }
        }
        setStudents([]);
        setSubjects([]);
        setMarks([]);
        setStudentComments({});
        setSequenceResults([]);
        setFirstTermResults([]);
        setSecondTermResults([]);
        setThirdTermResults([]);
        setAnnualResults([]);
        setSelectedSequence('firstSequence');
        setSelectedResultView('sequence');
      } catch (err: any) {
        setErrorMessage(t('error_resetting_data') + ': ' + err.message);
      }
    }
  };

  // Language handler
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (err: any) {
      setErrorMessage(t('error_logging_out') + ': ' + err.message);
    }
  };

  // Check if there are any marks entered
  const hasMarks = marks.some(m => m.marks !== '');

  // Convert marks for MarksTable
  const marksForTable: StudentMarks[] = students.map(student => {
    const studentMarks: StudentMarks = {
      firstSequence: {},
      secondSequence: {},
      thirdSequence: {},
      fourthSequence: {},
      fifthSequence: {},
      sixthSequence: {},
    };
    marks.forEach(m => {
      if (m.studentId === student.id) {
        const subject = subjects.find(s => s.id === m.subjectId);
        if (subject) {
          studentMarks[m.sequence][subject.name] = m.marks;
        }
      }
    });
    return studentMarks;
  });

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{t('error')}: {error.message}</Typography>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Container maxWidth="lg" sx={{ py: 4 }}>
              {errorMessage && (
                <Alert severity="error" onClose={() => setErrorMessage('')} sx={{ mb: 2 }}>
                  {errorMessage}
                </Alert>
              )}
              <Grid container spacing={3}>
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: theme.palette.primary.main,
                      fontWeight: 'bold',
                    }}
                  >
                    <span style={{ color: theme.palette.primary.main }}>Brain</span>
                    <span style={{ color: theme.palette.secondary.main }}>Board</span>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>{t('language')}</InputLabel>
                      <Select
                        value={i18n.language}
                        label={t('language')}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                      >
                        <MenuItem value="en">{t('english')}</MenuItem>
                        <MenuItem value="fr">{t('french')}</MenuItem>
                      </Select>
                    </FormControl>
                    <Button variant="outlined" color="error" onClick={handleLogout}>
                      {t('logout')}
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      onClick={() => setStudentsOpen(true)}
                      sx={{ bgcolor: theme.palette.primary.main }}
                    >
                      {t('students')}
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => setSubjectsOpen(true)}
                      disabled={students.length === 0}
                      sx={{ bgcolor: theme.palette.secondary.main }}
                    >
                      {t('subjects')}
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleResetData}>
                      {t('reset_data')}
                    </Button>
                  </Box>
                </Grid>

                {students.length > 0 && subjects.length > 0 && (
                  <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {t('enter_marks_comments')}
                      </Typography>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>{t('sequence')}</InputLabel>
                        <Select
                          value={selectedSequence}
                          label={t('sequence')}
                          onChange={(e) => setSelectedSequence(e.target.value as keyof StudentMarks)}
                        >
                          <MenuItem value="firstSequence">{t('first_sequence')}</MenuItem>
                          <MenuItem value="secondSequence">{t('second_sequence')}</MenuItem>
                          <MenuItem value="thirdSequence">{t('third_sequence')}</MenuItem>
                          <MenuItem value="fourthSequence">{t('fourth_sequence')}</MenuItem>
                          <MenuItem value="fifthSequence">{t('fifth_sequence')}</MenuItem>
                          <MenuItem value="sixthSequence">{t('sixth_sequence')}</MenuItem>
                        </Select>
                      </FormControl>
                      <MarksTable
                        students={students}
                        subjects={subjects}
                        marks={marksForTable}
                        selectedSequence={selectedSequence}
                        studentComments={studentComments}
                        onMarkChange={(studentIndex, subject, mark, maxTotal) => {
                          const student = students[studentIndex];
                          const subjectObj = subjects.find(s => s.name === subject);
                          if (student && subjectObj) {
                            handleMarkChange(student.id, subjectObj.id, mark, maxTotal);
                          }
                        }}
                        onCommentChange={handleCommentChange}
                      />
                      <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          onClick={calculateSequenceResults}
                          disabled={!hasMarks}
                        >
                          {t('calculate_results')}
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={calculateTermResults}
                          disabled={!hasMarks}
                        >
                          {t('term_results')}
                        </Button>
                        <Button
                          variant="contained"
                          color="info"
                          onClick={() => setReportModalOpen(true)}
                          disabled={!hasMarks}
                        >
                          {t('student_reports')}
                        </Button>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={() => setBulkMarksModalOpen(true)}
                        >
                          {t('bulk_marks_entry')}
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {sequenceResults.length > 0 && (
                  <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 2 }}>
                      <ResultsTable
                        selectedResultView={selectedResultView}
                        onResultViewChange={setSelectedResultView}
                        sequenceResults={sequenceResults}
                        firstTermResults={firstTermResults}
                        secondTermResults={secondTermResults}
                        thirdTermResults={thirdTermResults}
                        annualResults={annualResults}
                        sequenceClassAverage={sequenceClassAverage}
                        firstTermClassAverage={firstTermClassAverage}
                        secondTermClassAverage={secondTermClassAverage}
                        thirdTermClassAverage={thirdTermClassAverage}
                        annualClassAverage={annualClassAverage}
                        sequencePassPercentage={sequencePassPercentage}
                        firstTermPassPercentage={firstTermPassPercentage}
                        secondTermPassPercentage={secondTermPassPercentage}
                        thirdTermPassPercentage={thirdTermPassPercentage}
                        annualPassPercentage={annualPassPercentage}
                        passingMark={PASSING_MARK}
                        onDownloadPDF={() => {
                          generateResultsPDF(
                            t(selectedResultView),
                            selectedResultView === 'sequence' ? sequenceResults :
                            selectedResultView === 'firstTerm' ? firstTermResults :
                            selectedResultView === 'secondTerm' ? secondTermResults :
                            selectedResultView === 'thirdTerm' ? thirdTermResults :
                            annualResults,
                            selectedResultView === 'sequence' ? sequenceClassAverage! :
                            selectedResultView === 'firstTerm' ? firstTermClassAverage! :
                            selectedResultView === 'secondTerm' ? secondTermClassAverage! :
                            selectedResultView === 'thirdTerm' ? thirdTermClassAverage! :
                            annualClassAverage!,
                            selectedResultView === 'sequence' ? sequencePassPercentage! :
                            selectedResultView === 'firstTerm' ? firstTermPassPercentage! :
                            selectedResultView === 'secondTerm' ? secondTermPassPercentage! :
                            selectedResultView === 'thirdTerm' ? thirdTermPassPercentage! :
                            annualPassPercentage!,
                            selectedResultView === 'annual',
                            t
                          );
                        }}
                        isDownloadDisabled={false}
                      />
                    </Paper>
                  </Grid>
                )}
              </Grid>

              <StudentModal
                open={studentsOpen}
                onClose={() => setStudentsOpen(false)}
                students={students}
                onAddStudent={handleAddStudent}
                onEditStudent={(index, name) => {
                  const student = students[index];
                  if (student) handleEditStudent(student.id, name);
                }}
                onDeleteStudent={(index) => {
                  const student = students[index];
                  if (student) handleDeleteStudent(student.id);
                }}
              />

              <SubjectModal
                open={subjectsOpen}
                onClose={() => setSubjectsOpen(false)}
                subjects={subjects}
                onAddSubject={handleAddSubject}
                onEditSubject={(index, name, total) => {
                  const subject = subjects[index];
                  if (subject) handleEditSubject(subject.id, name, total);
                }}
                onDeleteSubject={(index) => {
                  const subject = subjects[index];
                  if (subject) handleDeleteSubject(subject.id);
                }}
              />

              <ReportModal
                open={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                students={students}
                onGenerateReport={handleGenerateStudentReport}
                onGenerateAllReports={handleGenerateAllReports}
                selectedSequence={selectedSequence}
                selectedResultView={selectedResultView}
              />

              <BulkMarksEntry
                open={bulkMarksModalOpen}
                onClose={() => setBulkMarksModalOpen(false)}
                students={students}
                subjects={subjects}
                selectedSequence={selectedSequence}
                onSave={(studentIndex, subject, mark, maxTotal) => {
                  const student = students[studentIndex];
                  const subjectObj = subjects.find(s => s.name === subject);
                  if (student && subjectObj) {
                    handleMarkChange(student.id, subjectObj.id, mark, maxTotal);
                  }
                }}
              />
            </Container>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;