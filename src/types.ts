export interface Student {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  total: number;
}

export interface Mark {
  id: string;
  studentId: string;
  subjectId: string;
  sequence: string;
  marks: number;
}

export interface Comment {
  id: string;
  studentId: string;
  sequence: string;
  comment: string;
}

export interface TermResult {
  student: string;
  average: number;
  rank: number;
}