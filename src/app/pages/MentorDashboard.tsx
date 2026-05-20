import { useState } from 'react';
import { useAuth, Student } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import Logo from '../components/Logo';
import { Users, LogOut, MessageSquare, AlertCircle, Mail, User, BookOpen, BarChart3, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';

export default function MentorDashboard() {
  const { user, students, mentors, messages, updateStudent, updateMentor, addMessage, addNotification, logout } = useAuth();
  const mentor = mentors.find(m => m.id === user?.id);
  const myStudents = students.filter(s => s.mentorId === user?.id);

  const [activeTab, setActiveTab] = useState('overview');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [projectComment, setProjectComment] = useState('');
  const [profileEdit, setProfileEdit] = useState({
    name: mentor?.name || '',
    department: mentor?.department || '',
    designation: mentor?.designation || '',
    phone: mentor?.phone || '',
  });

  // Filter students by semester
  const filteredStudents = semesterFilter === 'all'
    ? myStudents
    : myStudents.filter(s => s.semester === semesterFilter);

  // Identify underperforming students
  const underperformingStudents = myStudents.filter(student => {
    const avgAttendance = student.courses.reduce((acc, c) => acc + c.attendance, 0) / (student.courses.length || 1);
    return (student.cgpa || 0) < 7.0 || avgAttendance < 75;
  });

  const handleSaveProfile = () => {
    if (!mentor) return;

    updateMentor(mentor.id, {
      name: profileEdit.name,
      department: profileEdit.department,
      designation: profileEdit.designation,
      phone: profileEdit.phone,
    });

    toast.success('Profile updated successfully', { duration: 3000 });
  };

  const handleSendMessage = (studentId: string) => {
    if (!messageContent.trim()) {
      toast.error('Please enter a message', { duration: 3000 });
      return;
    }

    addMessage({
      from: user!.id,
      to: studentId,
      content: messageContent,
    });

    addNotification({
      userId: studentId,
      content: `Your mentor has sent you a message`,
      type: 'message',
    });

    setMessageContent('');
    toast.success('Message sent successfully', { duration: 3000 });
  };

  const handleAddProjectComment = (studentId: string, updateId: string) => {
    if (!projectComment.trim()) {
      toast.error('Please enter a comment', { duration: 3000 });
      return;
    }

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const updatedProgress = student.projectProgress.map(p =>
      p.id === updateId ? { ...p, mentorComment: projectComment } : p
    );

    updateStudent(studentId, { projectProgress: updatedProgress });

    addNotification({
      userId: studentId,
      content: `Your mentor has commented on your project progress`,
      type: 'approval',
    });

    setProjectComment('');
    toast.success('Comment added successfully', { duration: 3000 });
  };

  const handleContactUnderperforming = () => {
    underperformingStudents.forEach(student => {
      addNotification({
        userId: student.id,
        content: `Your mentor has requested a meeting to discuss your academic progress`,
        type: 'request',
      });
    });

    toast.success(`Notifications sent to ${underperformingStudents.length} students`, { duration: 3000 });
  };

  const getAverageAttendance = (student: Student) => {
    if (student.courses.length === 0) return 0;
    return (student.courses.reduce((acc, c) => acc + c.attendance, 0) / student.courses.length).toFixed(1);
  };

  const getTotalMarks = (student: Student) => {
    if (student.courses.length === 0) return 0;
    const totalMarks = student.courses.reduce((acc, c) => {
      return acc + c.sessional1 + c.midterm + c.sessional2 + c.endterm;
    }, 0);
    return (totalMarks / (student.courses.length * 100) * 100).toFixed(1);
  };

  if (!mentor) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Mentor Portal</h1>
              <p className="text-xs text-gray-600">{mentor.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-2 border-gray-300">
              <Users className="size-3" />
              {myStudents.length} Students
            </Badge>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl bg-gray-100">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-white">
              Students
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-white">
              <User className="size-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="size-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Users className="size-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{myStudents.length}</p>
                      <p className="text-xs text-gray-600">Total Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="size-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{myStudents.filter(s => (s.cgpa || 0) >= 8).length}</p>
                      <p className="text-xs text-gray-600">High Performers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="size-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="size-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{underperformingStudents.length}</p>
                      <p className="text-xs text-gray-600">Need Attention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="size-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="size-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{messages.filter(m => m.to === user?.id && !m.read).length}</p>
                      <p className="text-xs text-gray-600">New Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alert for underperforming students */}
            {underperformingStudents.length > 0 && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="size-5 text-red-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-red-900">Students Requiring Immediate Attention</h3>
                        <p className="text-sm text-red-800 mt-1">
                          {underperformingStudents.length} student(s) have CGPA below 7.0 or attendance below 75%
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {underperformingStudents.map(s => (
                            <Badge key={s.id} variant="outline" className="border-red-300 bg-white">
                              {s.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleContactUnderperforming} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                      <Mail className="size-4" />
                      Contact All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick student summary */}
            <Card className="border-gray-200">
              <CardHeader className="border-b">
                <CardTitle className="text-gray-900">Student Overview</CardTitle>
                <CardDescription>Quick summary of all your students</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {myStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <Users className="size-12 text-gray-400 mx-auto mb-3" />
                      <p>No students allocated yet</p>
                    </div>
                  ) : (
                    myStudents.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setSelectedStudent(student);
                          setActiveTab('students');
                        }}
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-600">{student.rollNo} • Year {student.year} • Sem {student.semester}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={student.cgpa && student.cgpa >= 7 ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}>
                            CGPA: {student.cgpa !== undefined ? student.cgpa.toFixed(2) : 'N/A'}
                          </Badge>
                          <Badge variant="outline" className={Number(getAverageAttendance(student)) >= 75 ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}>
                            Att: {getAverageAttendance(student)}%
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="mb-6 border-gray-200">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Student Management</CardTitle>
                    <CardDescription>View and manage your students</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="text-sm text-gray-600">Filter by Semester:</Label>
                    <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <Users className="size-12 text-gray-400 mx-auto mb-3" />
                    <p>No students found for selected semester</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredStudents.map(student => (
                      <Card
                        key={student.id}
                        className="border-gray-200 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{student.name}</h3>
                              <p className="text-sm text-gray-600">{student.rollNo} • {student.department}</p>
                              <p className="text-xs text-gray-500 mt-1">Year {student.year} • Semester {student.semester}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                            <div className="text-center">
                              <p className="text-xs text-gray-600">CGPA</p>
                              <p className="font-semibold text-gray-900">{student.cgpa !== undefined ? student.cgpa.toFixed(2) : 'N/A'}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Attendance</p>
                              <p className="font-semibold text-gray-900">{getAverageAttendance(student)}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Avg Score</p>
                              <p className="font-semibold text-gray-900">{getTotalMarks(student)}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="max-w-2xl mx-auto border-gray-200">
              <CardHeader className="border-b">
                <div className="flex items-center gap-4">
                  <img src={mentor.profilePhoto} alt={mentor.name} className="size-20 rounded-full border-4 border-gray-200" />
                  <div>
                    <CardTitle className="text-gray-900">Mentor Profile</CardTitle>
                    <CardDescription>Update your profile information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={profileEdit.name}
                      onChange={(e) => setProfileEdit({ ...profileEdit, name: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      value={mentor.email}
                      disabled
                      className="mt-1.5 bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <Label>Department</Label>
                    <Input
                      value={profileEdit.department}
                      onChange={(e) => setProfileEdit({ ...profileEdit, department: e.target.value })}
                      placeholder="e.g., Computer Science"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Designation</Label>
                    <Input
                      value={profileEdit.designation}
                      onChange={(e) => setProfileEdit({ ...profileEdit, designation: e.target.value })}
                      placeholder="e.g., Associate Professor"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={profileEdit.phone}
                      onChange={(e) => setProfileEdit({ ...profileEdit, phone: e.target.value })}
                      placeholder="e.g., +91 98765 43210"
                      className="mt-1.5"
                    />
                  </div>

                  <Button onClick={handleSaveProfile} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Student Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-gray-900">{selectedStudent.name}</DialogTitle>
                <div className="text-sm text-gray-600">
                  {selectedStudent.rollNo} • {selectedStudent.department} • Year {selectedStudent.year} • Semester {selectedStudent.semester}
                </div>
              </DialogHeader>

              <Tabs defaultValue="courses" className="mt-4">
                <TabsList className="grid grid-cols-3 w-full bg-gray-100">
                  <TabsTrigger value="courses" className="data-[state=active]:bg-white">
                    <BookOpen className="size-4" />
                    Courses
                  </TabsTrigger>
                  <TabsTrigger value="project" className="data-[state=active]:bg-white">
                    <FolderKanban className="size-4" />
                    Project
                  </TabsTrigger>
                  <TabsTrigger value="message" className="data-[state=active]:bg-white">
                    <MessageSquare className="size-4" />
                    Message
                  </TabsTrigger>
                </TabsList>

                {/* Courses & Marks */}
                <TabsContent value="courses" className="space-y-4 mt-4">
                  {selectedStudent.courses.length === 0 ? (
                    <p className="text-center py-8 text-gray-600">No courses added yet</p>
                  ) : (
                    selectedStudent.courses.map(course => {
                      const total = course.sessional1 + course.midterm + course.sessional2 + course.endterm;
                      const percentage = (total / 100 * 100).toFixed(1);

                      return (
                        <Card key={course.id} className="border-gray-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <Badge variant="outline" className="mb-2">{course.courseId}</Badge>
                                <CardTitle className="text-base text-gray-900">{course.name}</CardTitle>
                                <CardDescription>Instructor: {course.instructorName}</CardDescription>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">{total}/100</p>
                                <p className="text-sm text-gray-600">{percentage}%</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-4 gap-2 text-center mb-3">
                              <div>
                                <p className="text-xs text-gray-600">Sess. 1 (10)</p>
                                <Badge className="mt-1">{course.sessional1}</Badge>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Midterm (30)</p>
                                <Badge className="mt-1">{course.midterm}</Badge>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Sess. 2 (10)</p>
                                <Badge className="mt-1">{course.sessional2}</Badge>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Endterm (50)</p>
                                <Badge className="mt-1">{course.endterm}</Badge>
                              </div>
                            </div>
                            <div className="pt-3 border-t">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Attendance</span>
                                <Badge variant="outline" className={course.attendance < 75 ? 'border-red-300 bg-red-50 text-red-700' : 'border-green-300 bg-green-50 text-green-700'}>
                                  {course.attendance}%
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </TabsContent>

                {/* Project Progress */}
                <TabsContent value="project" className="space-y-4 mt-4">
                  {selectedStudent.projectProgress.length === 0 ? (
                    <p className="text-center py-8 text-gray-600">No project updates yet</p>
                  ) : (
                    selectedStudent.projectProgress.map(update => (
                      <Card key={update.id} className="border-gray-200">
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <p className="text-sm text-gray-900">{update.content}</p>
                              <Badge variant="outline" className="text-xs">
                                {new Date(update.timestamp).toLocaleDateString()}
                              </Badge>
                            </div>
                            {update.fileName && (
                              <p className="text-sm text-gray-600">📎 {update.fileName}</p>
                            )}
                            {update.mentorComment ? (
                              <div className="mt-3 pt-3 border-t bg-green-50 p-3 rounded-md">
                                <p className="text-xs font-semibold text-green-900 mb-1">Your Comment:</p>
                                <p className="text-sm text-green-800">{update.mentorComment}</p>
                              </div>
                            ) : (
                              <div className="mt-3 pt-3 border-t">
                                <Label className="text-xs">Add Feedback</Label>
                                <Textarea
                                  placeholder="Provide guidance..."
                                  value={projectComment}
                                  onChange={(e) => setProjectComment(e.target.value)}
                                  rows={2}
                                  className="mt-1.5 text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAddProjectComment(selectedStudent.id, update.id)}
                                  className="mt-2 bg-indigo-600 hover:bg-indigo-700"
                                >
                                  Submit Comment
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Send Message */}
                <TabsContent value="message" className="mt-4">
                  <Card className="border-gray-200">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Message to {selectedStudent.name}</Label>
                          <Textarea
                            placeholder="Type your message..."
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            rows={4}
                            className="mt-1.5"
                          />
                        </div>
                        <Button onClick={() => handleSendMessage(selectedStudent.id)} className="w-full bg-indigo-600 hover:bg-indigo-700">
                          Send Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
