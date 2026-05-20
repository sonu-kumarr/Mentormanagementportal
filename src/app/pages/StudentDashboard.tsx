import { useState, useRef } from 'react';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import Logo from '../components/Logo';
import { LogOut, Plus, BookOpen, BarChart3, MessageSquare, FolderKanban, Bell, Key, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const { user, students, mentors, messages, notifications, updateStudent, addMessage, changePassword, logout, markNotificationRead } = useAuth();
  const student = students.find(s => s.id === user?.id);
  const mentor = mentors.find(m => m.id === student?.mentorId);

  const [newCourse, setNewCourse] = useState({ courseId: '', name: '', instructorName: '', semester: student?.semester || '' });
  const [messageContent, setMessageContent] = useState('');
  const [projectUpdate, setProjectUpdate] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [marks, setMarks] = useState({ sessional1: 0, midterm: 0, sessional2: 0, endterm: 0 });
  const [attendance, setAttendance] = useState(0);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [messageFile, setMessageFile] = useState<File | null>(null);
  const [projectFile, setProjectFile] = useState<File | null>(null);

  const messageFileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  const studentMessages = messages.filter(m => m.to === user?.id || m.from === user?.id);
  const studentNotifications = notifications.filter(n => n.userId === user?.id && !n.read);

  const handleAddCourse = () => {
    if (!student || !newCourse.name || !newCourse.courseId || !newCourse.instructorName) {
      toast.error('Please fill all required fields', { duration: 3000 });
      return;
    }

    const course = {
      id: `c${Date.now()}`,
      courseId: newCourse.courseId,
      name: newCourse.name,
      instructorName: newCourse.instructorName,
      semester: newCourse.semester,
      sessional1: 0,
      midterm: 0,
      sessional2: 0,
      endterm: 0,
      attendance: 0,
    };

    updateStudent(student.id, {
      courses: [...student.courses, course],
    });

    setNewCourse({ courseId: '', name: '', instructorName: '', semester: student.semester });
    toast.success('Course added successfully', { duration: 3000 });
  };

  const handleUpdateMarks = () => {
    if (!student || !selectedCourse) return;

    const updatedCourses = student.courses.map(c =>
      c.id === selectedCourse ? { ...c, ...marks } : c
    );

    updateStudent(student.id, { courses: updatedCourses });
    toast.success('Marks updated successfully', { duration: 3000 });
    setSelectedCourse(null);
  };

  const handleUpdateAttendance = (courseId: string) => {
    if (!student) return;

    const updatedCourses = student.courses.map(c =>
      c.id === courseId ? { ...c, attendance } : c
    );

    updateStudent(student.id, { courses: updatedCourses });
    toast.success('Attendance updated successfully', { duration: 3000 });
  };

  const handleSendMessage = () => {
    if (!messageContent.trim() || !mentor) {
      toast.error('Please enter a message', { duration: 3000 });
      return;
    }

    const fileUrl = messageFile ? URL.createObjectURL(messageFile) : undefined;
    const fileName = messageFile?.name;

    addMessage({
      from: user!.id,
      to: mentor.id,
      content: messageContent,
      fileUrl,
      fileName,
    });

    setMessageContent('');
    setMessageFile(null);
    toast.success('Message sent to mentor', { duration: 3000 });
  };

  const handleAddProjectUpdate = () => {
    if (!student || !projectUpdate.trim()) {
      toast.error('Please enter project update', { duration: 3000 });
      return;
    }

    const fileUrl = projectFile ? URL.createObjectURL(projectFile) : undefined;
    const fileName = projectFile?.name;

    const newUpdate = {
      id: `p${Date.now()}`,
      content: projectUpdate,
      timestamp: new Date(),
      fileUrl,
      fileName,
    };

    updateStudent(student.id, {
      projectProgress: [...student.projectProgress, newUpdate],
    });

    setProjectUpdate('');
    setProjectFile(null);
    toast.success('Project update added successfully', { duration: 3000 });
  };

  const handleChangePassword = () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill all fields', { duration: 3000 });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match', { duration: 3000 });
      return;
    }

    const success = changePassword(user!.id, 'student', passwordForm.oldPassword, passwordForm.newPassword);

    if (success) {
      toast.success('Password changed successfully', { duration: 3000 });
      setShowPasswordDialog(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error('Current password is incorrect', { duration: 3000 });
    }
  };

  if (!student) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const totalMarks = student.courses.reduce((acc, c) => acc + c.sessional1 + c.midterm + c.sessional2 + c.endterm, 0);
  const avgMarks = student.courses.length > 0 ? (totalMarks / (student.courses.length * 100)).toFixed(1) : 'N/A';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Student Portal</h1>
              <p className="text-xs text-gray-600">{student.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="size-5" />
                {studentNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 size-2 bg-red-600 rounded-full animate-pulse" />
                )}
              </Button>
            </div>
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-300">
                  <Key className="size-4" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <Button onClick={handleChangePassword} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Update Password
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Student Info Card */}
        <Card className="mb-6 border-gray-200">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-6 gap-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-600">Roll Number</p>
                <p className="font-semibold text-gray-900">{student.rollNo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Department</p>
                <p className="font-semibold text-gray-900">{student.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Year</p>
                <p className="font-semibold text-gray-900">Year {student.year}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Semester</p>
                <p className="font-semibold text-gray-900">Semester {student.semester}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">CGPA</p>
                <p className="font-semibold text-gray-900">{student.cgpa !== undefined ? student.cgpa.toFixed(2) : 'Not Available'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg Score</p>
                <p className="font-semibold text-gray-900">{avgMarks}%</p>
              </div>
            </div>

            {/* Mentor Allocation Status */}
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-2">Mentor Status</p>
              {mentor ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <CheckCircle2 className="size-5 text-green-600" />
                  <img src={mentor.profilePhoto} alt={mentor.name} className="size-10 rounded-full border-2 border-green-300" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{mentor.name}</p>
                    <p className="text-sm text-gray-600">{mentor.email}</p>
                    {mentor.designation && <p className="text-xs text-gray-500">{mentor.designation}</p>}
                  </div>
                  <Badge className="bg-green-600">Allocated</Badge>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="size-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Not Allocated</p>
                    <p className="text-sm text-gray-600">Please contact administration for mentor allocation</p>
                  </div>
                  <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">Pending</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        {studentNotifications.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Bell className="size-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">Notifications</h3>
                  <div className="space-y-2">
                    {studentNotifications.map(notif => (
                      <div key={notif.id} className="flex items-start justify-between bg-white p-3 rounded border border-red-200">
                        <div className="flex-1">
                          <p className="text-sm text-red-800">{notif.content}</p>
                          <p className="text-xs text-red-600 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markNotificationRead(notif.id)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-gray-100">
            <TabsTrigger value="courses" className="data-[state=active]:bg-white">
              <BookOpen className="size-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="marks" className="data-[state=active]:bg-white">
              <BarChart3 className="size-4" />
              Marks
            </TabsTrigger>
            <TabsTrigger value="project" className="data-[state=active]:bg-white">
              <FolderKanban className="size-4" />
              Project
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-white">
              <MessageSquare className="size-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card className="border-gray-200">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">My Courses</CardTitle>
                    <CardDescription>Manage your enrolled courses for Semester {student.semester}</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="size-4" />
                        Add Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Course</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Course ID *</Label>
                          <Input
                            placeholder="e.g., CS301"
                            value={newCourse.courseId}
                            onChange={(e) => setNewCourse({ ...newCourse, courseId: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Course Name *</Label>
                          <Input
                            placeholder="e.g., Data Structures"
                            value={newCourse.name}
                            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Instructor Name *</Label>
                          <Input
                            placeholder="e.g., Dr. Singh"
                            value={newCourse.instructorName}
                            onChange={(e) => setNewCourse({ ...newCourse, instructorName: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Semester</Label>
                          <Input
                            value={newCourse.semester}
                            onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <Button onClick={handleAddCourse} className="w-full bg-indigo-600 hover:bg-indigo-700">
                          Add Course
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {student.courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="size-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No courses added yet</p>
                    <p className="text-sm text-gray-500 mt-1">Click "Add Course" to get started</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {student.courses.map(course => (
                      <Card key={course.id} className="border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge variant="outline" className="mb-2">{course.courseId}</Badge>
                              <CardTitle className="text-base text-gray-900">{course.name}</CardTitle>
                              <CardDescription className="mt-1">Instructor: {course.instructorName}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Attendance</span>
                              <Badge variant="outline" className={course.attendance < 75 ? 'border-red-300 bg-red-50 text-red-700' : 'border-green-300 bg-green-50 text-green-700'}>
                                {course.attendance}%
                              </Badge>
                            </div>
                            <div>
                              <Label className="text-xs">Update Attendance %</Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  defaultValue={course.attendance}
                                  onChange={(e) => setAttendance(Number(e.target.value))}
                                  className="h-8"
                                />
                                <Button size="sm" onClick={() => handleUpdateAttendance(course.id)} className="bg-indigo-600 hover:bg-indigo-700">
                                  Update
                                </Button>
                              </div>
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

          {/* Marks Tab */}
          <TabsContent value="marks">
            <Card className="border-gray-200">
              <CardHeader className="border-b">
                <CardTitle className="text-gray-900">Exam Marks</CardTitle>
                <CardDescription>Upload and track your exam scores (Total: 100 marks)</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {student.courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="size-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No courses available</p>
                    <p className="text-sm text-gray-500 mt-1">Add courses first to track marks</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {student.courses.map(course => {
                      const total = course.sessional1 + course.midterm + course.sessional2 + course.endterm;
                      const percentage = (total / 100 * 100).toFixed(1);

                      return (
                        <Card key={course.id} className="border-gray-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <Badge variant="outline" className="mb-2">{course.courseId}</Badge>
                                <CardTitle className="text-base text-gray-900">{course.name}</CardTitle>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">{total}/100</p>
                                <p className="text-sm text-gray-600">{percentage}%</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                              <div>
                                <Label className="text-xs text-gray-600">Sessional 1 (10)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  defaultValue={course.sessional1}
                                  onChange={(e) => setMarks({ ...marks, sessional1: Number(e.target.value) })}
                                  className="h-8 mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Midterm (30)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="30"
                                  defaultValue={course.midterm}
                                  onChange={(e) => setMarks({ ...marks, midterm: Number(e.target.value) })}
                                  className="h-8 mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Sessional 2 (10)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  defaultValue={course.sessional2}
                                  onChange={(e) => setMarks({ ...marks, sessional2: Number(e.target.value) })}
                                  className="h-8 mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Endterm (50)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="50"
                                  defaultValue={course.endterm}
                                  onChange={(e) => setMarks({ ...marks, endterm: Number(e.target.value) })}
                                  className="h-8 mt-1"
                                />
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedCourse(course.id);
                                handleUpdateMarks();
                              }}
                              className="w-full bg-indigo-600 hover:bg-indigo-700"
                            >
                              Update Marks
                            </Button>
                            <div className="mt-4 pt-4 border-t">
                              <div className="grid grid-cols-4 gap-2 text-center">
                                <div>
                                  <p className="text-xs text-gray-600">Sess. 1</p>
                                  <Badge className="mt-1">{course.sessional1}/10</Badge>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Midterm</p>
                                  <Badge className="mt-1">{course.midterm}/30</Badge>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Sess. 2</p>
                                  <Badge className="mt-1">{course.sessional2}/10</Badge>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Endterm</p>
                                  <Badge className="mt-1">{course.endterm}/50</Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Project Tab */}
          <TabsContent value="project">
            <Card className="border-gray-200">
              <CardHeader className="border-b">
                <CardTitle className="text-gray-900">Project Progress</CardTitle>
                <CardDescription>Track and share your project updates with your mentor</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <Label>Add Project Update</Label>
                    <Textarea
                      placeholder="Describe your progress, challenges, and achievements..."
                      value={projectUpdate}
                      onChange={(e) => setProjectUpdate(e.target.value)}
                      rows={4}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Attach File (Optional)</Label>
                    <div className="mt-1.5">
                      <input
                        ref={projectFileInputRef}
                        type="file"
                        onChange={(e) => setProjectFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => projectFileInputRef.current?.click()}
                        className="w-full border-gray-300"
                      >
                        <Upload className="size-4" />
                        {projectFile ? projectFile.name : 'Choose File'}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleAddProjectUpdate} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="size-4" />
                    Add Update
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Previous Updates</h3>
                  {student.projectProgress.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <FolderKanban className="size-12 text-gray-400 mx-auto mb-3" />
                      <p>No updates yet</p>
                    </div>
                  ) : (
                    student.projectProgress.map(update => (
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
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Upload className="size-4" />
                                <span>{update.fileName}</span>
                              </div>
                            )}
                            {update.mentorComment && (
                              <div className="mt-3 pt-3 border-t bg-green-50 p-3 rounded-md">
                                <p className="text-xs font-semibold text-green-900 mb-1">Mentor's Comment:</p>
                                <p className="text-sm text-green-800">{update.mentorComment}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="border-gray-200">
              <CardHeader className="border-b">
                <CardTitle className="text-gray-900">Messages with Mentor</CardTitle>
                <CardDescription>Communicate with your mentor for guidance and appointments</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <Label>Send Message</Label>
                    <Textarea
                      placeholder="Type your message here..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Attach File (Optional)</Label>
                    <div className="mt-1.5">
                      <input
                        ref={messageFileInputRef}
                        type="file"
                        onChange={(e) => setMessageFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => messageFileInputRef.current?.click()}
                        className="w-full border-gray-300"
                      >
                        <Upload className="size-4" />
                        {messageFile ? messageFile.name : 'Choose File'}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleSendMessage} disabled={!mentor} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Send Message
                  </Button>
                  {!mentor && (
                    <p className="text-sm text-red-600 text-center">No mentor assigned yet. Please contact admin.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Conversation</h3>
                  {studentMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <MessageSquare className="size-12 text-gray-400 mx-auto mb-3" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    studentMessages.map(msg => (
                      <Card key={msg.id} className={msg.from === user?.id ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}>
                        <CardContent className="pt-4">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-semibold text-gray-600">
                                {msg.from === user?.id ? 'You' : mentor?.name || 'Mentor'}
                              </p>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900">{msg.content}</p>
                            {msg.fileName && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                <Upload className="size-4" />
                                <span>{msg.fileName}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
