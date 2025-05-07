import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Student } from '../types';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  students: Student[];
  onGenerateReport: (studentId: string) => void;
  onGenerateAllReports: () => void;
  selectedSequence: keyof StudentMarks;
  selectedResultView: 'sequence' | 'firstTerm' | 'secondTerm' | 'thirdTerm' | 'annual';
}

const ReportModal: React.FC<ReportModalProps> = ({
  open,
  onClose,
  students,
  onGenerateReport,
  onGenerateAllReports,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('student_reports')}</DialogTitle>
      <DialogContent>
        <List>
          {students.map(student => (
            <ListItem
              key={student.id}
              button
              onClick={() => onGenerateReport(student.id)}
            >
              <ListItemText primary={student.name} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
        <Button variant="contained" onClick={onGenerateAllReports}>
          {t('generate_all_reports')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportModal;