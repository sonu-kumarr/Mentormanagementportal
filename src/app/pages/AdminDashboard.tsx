import { useState } from 'react';
import { useAuth, Student, Mentor } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import Logo from '../components/Logo';
import { Shield, LogOut, UserPlus, Users, GraduationCap, Key, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, students, mentors, addMentor, allocateStudentToMentor, resetPassword, logout } = useAuth();

  const [cgpaFilter, setCgpaFilter] = useState<number>(0);
  const [courseAttendanceFilter, setCourseAttendanceFilter] = useState<number>(0);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [allocationType, setAllocationType] = useState<'manual' | 'auto'>('manual');
  const [autoAllocationType, setAutoAllocationType] = useState<'equal' | 'cgpa' | 'name'>('equal');

  // New Mentor Form
  const [newMentor, setNewMentor] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: '',
  });

  // Manual Allocation
  const [allocationStudentId, setAllocationStudentId] = useState('');
  const [allocationMentorId, setAllocationMentorId] = useState('');

  // Password Reset
  const [resetEmail, setResetEmail] = useState('');
  const [resetRole, setResetRole] = useState<'student' | 'mentor'>('student');
  const [newPassword, setNewPassword] = useState('');

  // Get all unique courses
  const allCourses = Array.from(
    new Set(students.flatMap(s => s.courses.map(c => c.name)))
  );

  // Filter students
  const filteredStudents = students.filter(student => {
    if (cgpaFilter > 0 && (student.cgpa || 0) < cgpaFilter) return false;
    if (courseAttendanceFilter > 0 && selectedCourse !== 'all') {
      const course = student.courses.find(c => c.name === selectedCourse);
      if (!course || course.attendance < courseAttendanceFilter) return false;
    }
    return true;
  });

  const unallocatedStudents = students.filter(s => !s.mentorId);

  const handleAddMentor = () => {
    if (!newMentor.name || !newMentor.email || !newMentor.password) {
      toast.error('Please fill all required fields', { duration: 3000 });
      return;
    }

    const mentor: Mentor = {
      id: `m${mentors.length + 1}`,
      name: newMentor.name,
      email: newMentor.email,
      password: newMentor.password,
      studentIds: [],
      profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMentor.name}`,
      department: newMentor.department,
      designation: newMentor.designation,
    };

    addMentor(mentor);
    setNewMentor({ name: '', email: '', password: '', department: '', designation: '' });
    toast.success('Mentor added successfully', { duration: 3000 });
  };

  const handleManualAllocate = () => {
    if (!allocationStudentId || !allocationMentorId) {
      toast.error('Please select both student and mentor', { duration: 3000 });
      return;
    }

    allocateStudentToMentor(allocationStudentId, allocationMentorId);
    setAllocationStudentId('');
    setAllocationMentorId('');
    toast.success('Student allocated successfully', { duration: 3000 });
  };

  const handleAutoAllocate = () => {
    if (unallocatedStudents.length === 0) {
      toast.error('No unallocated students', { duration: 3000 });
      return;
    }

    if (mentors.length === 0) {
      toast.error('No mentors available', { duration: 3000 });
      return;
    }

    let studentsToAllocate = [...unallocatedStudents];

    if (autoAllocationType === 'name') {
      // Sort alphabetically
      studentsToAllocate.sort((a, b) => a.name.localeCompare(b.name));
    } else if (autoAllocationType === 'cgpa') {
      // Sort by CGPA (low to high, so struggling students get priority)
      studentsToAllocate.sort((a, b) => (a.cgpa || 0) - (b.cgpa || 0));
    }

    // Distribute students evenly among mentors
    let mentorIndex = 0;
    studentsToAllocate.forEach(student => {
      const mentor = mentors[mentorIndex];
      allocateStudentToMentor(student.id, mentor.id);

      mentorIndex = (mentorIndex + 1) % mentors.length;
    });

    toast.success(`Allocated ${studentsToAllocate.length} students automatically`, { duration: 3000 });
    setShowAllocationDialog(false);
  };

  const handleResetPassword = () => {
    if (!resetEmail || !newPassword) {
      toast.error('Please fill all fields', { duration: 3000 });
      return;
    }

    const success = resetPassword(resetEmail, resetRole, newPassword);
    if (success) {
      toast.success('Password reset successfully', { duration: 3000 });
      setResetEmail('');
      setNewPassword('');
    } else {
      toast.error('User not found', { duration: 3000 });
    }
  };

  const getAverageAttendance = (student: Student) => {
    if (student.courses.length === 0) return 0;
    return (student.courses.reduce((acc, c) => acc + c.attendance, 0) / student.courses.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
              <p className="text-xs text-gray-600">{user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={logout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="size-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="size-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                  <p className="text-xs text-gray-600">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="size-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="size-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{mentors.length}</p>
                  <p className="text-xs text-gray-600">Total Mentors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="size-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="size-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{unallocatedStudents.length}</p>
                  <p className="text-xs text-gray-600">Unallocated</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="size-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.mentorId).length}</p>
                  <p className="text-xs text-gray-600">Allocated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="allocate" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl bg-gray-100">
            <TabsTrigger value="allocate" className="data-[state=active]:bg-white">Allocate</TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-white">Students</TabsTrigger>
            <TabsTrigger value="mentors" className="data-[state=active]:bg-white">Mentors</TabsTrigger>
            <TabsTrigger value="add-mentor" className="data-[state=active]:bg-white">Add Mentor</TabsTrigger>
            <TabsTrigger value="reset" className="data-[state=active]:bg-white">Reset Password</TabsTrigger>
          </TabsList>

          {/* Allocate Tab */}
          <TabsContent value="allocate">
            {unallocatedStudents.length > 0 && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-red-900">{unallocatedStudents.length} Students Awaiting Allocation</h3>
                      <p className="text-sm text-red-800 mt-1">These students need to be assigned to mentors</p>
                    </div>
                    <Button
                      onClick={() => setShowAllocationDialog(true)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Zap className="size-4" />
                      Quick Allocate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Manual Allocation */}
              <Card className="border-gray-200">
                <CardHeader className="border-b">
                  <CardTitle className="text-gray-900">Manual Allocation</CardTitle>
                  <CardDescription>Assign individual students to mentors</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Select Student</Label>
                      <Select value={allocationStudentId} onValueChange={setAllocationStudentId}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Choose student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map(student => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name} ({student.rollNo}) - {student.mentorId ? '✓ Allocated' : '✗ Unallocated'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Select Mentor</Label>
                      <Select value={allocationMentorId} onValueChange={setAllocationMentorId}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Choose mentor" />
                        </SelectTrigger>
                        <SelectContent>
                          {mentors.map(mentor => (
                            <SelectItem key={mentor.id} value={mentor.id}>
                              {mentor.name} ({mentor.studentIds.length} students)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleManualAllocate} className="w-full bg-indigo-600 hover:bg-indigo-700">
                      Allocate Student
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Unallocated Students List */}
              <Card className="border-gray-200">
                <CardHeader className="border-b">
                  <CardTitle className="text-gray-900">Unallocated Students</CardTitle>
                  <CardDescription>Students waiting for mentor assignment</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {unallocatedStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="size-12 text-green-600 mx-auto mb-3" />
                      <p className="text-gray-900 font-semibold">All students allocated!</p>
                      <p className="text-sm text-gray-600 mt-1">Every student has been assigned to a mentor</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {unallocatedStudents.map(student => (
                        <div key={student.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-600">{student.rollNo} • Year {student.year} • Sem {student.semester}</p>
                            </div>
                            <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">Pending</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="border-gray-200">
              <CardHeader className="border-b">
                <CardTitle className="text-gray-900">Student Management</CardTitle>
                <CardDescription>View and filter all registered students</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Filters */}
                <Card className="mb-6 bg-gray-50 border-gray-200">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Minimum CGPA</Label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          placeholder="e.g., 7.0"
                          value={cgpaFilter || ''}
                          onChange={(e) => setCgpaFilter(Number(e.target.value))}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label>Course</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="All Courses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            {allCourses.map(course => (
                              <SelectItem key={course} value={course}>{course}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Min Course Attendance %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="e.g., 75"
                          value={courseAttendanceFilter || ''}
                          onChange={(e) => setCourseAttendanceFilter(Number(e.target.value))}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 border-gray-300"
                      onClick={() => {
                        setCgpaFilter(0);
                        setCourseAttendanceFilter(0);
                        setSelectedCourse('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>

                {/* Students List */}
                <div className="space-y-3">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                      <Users className="size-12 text-gray-400 mx-auto mb-3" />
                      <p>No students found with current filters</p>
                    </div>
                  ) : (
                    filteredStudents.map(student => {
                      const mentor = mentors.find(m => m.id === student.mentorId);
                      return (
                        <Card key={student.id} className="border-gray-200">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                                  <Badge variant="outline" className="border-gray-300">{student.rollNo}</Badge>
                                  <Badge variant="outline" className="border-gray-300">Year {student.year}</Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                                  <div>Dept: <strong className="text-gray-900">{student.department}</strong></div>
                                  <div>CGPA: <strong className="text-gray-900">{student.cgpa !== undefined ? student.cgpa.toFixed(2) : 'N/A'}</strong></div>
                                  <div>Avg Att: <strong className="text-gray-900">{getAverageAttendance(student)}%</strong></div>
                                  <div>Courses: <strong className="text-gray-900">{student.courses.length}</strong></div>
                                </div>
                                {mentor && (
                                  <div className="mt-2 text-sm">
                                    <span className="text-gray-600">Mentor:</span> <strong className="text-gray-900">{mentor.name}</strong>
                                  </div>
                                )}
                              </div>
                              {!student.mentorId && (
                                <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">
                                  Unallocated
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentors Tab */}
          <TabsContent value="mentors">
            <Card className="border-gray-200">
              <CardHeader className="border-b">
                <CardTitle className="text-gray-900">Mentor Management</CardTitle>
                <CardDescription>View all registered mentors and their students</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {mentors.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <Users className="size-12 text-gray-400 mx-auto mb-3" />
                    <p>No mentors registered yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mentors.map(mentor => (
                      <Card key={mentor.id} className="border-gray-200">
                        <CardContent className="pt-4">
                          <div className="flex gap-4">
                            <img src={mentor.profilePhoto} alt={mentor.name} className="size-16 rounded-full border-2 border-gray-200" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900">{mentor.name}</h3>
                              <p className="text-sm text-gray-600">{mentor.email}</p>
                              {mentor.designation && <p className="text-sm text-gray-600">{mentor.designation}</p>}
                              <div className="mt-2 flex items-center gap-2">
                                <Users className="size-4 text-gray-500" />
                                <span className="text-sm text-gray-600">{mentor.studentIds.length} student(s) assigned</span>
                              </div>
                            </div>
                            <Badge className="self-start">{mentor.studentIds.length} Students</Badge>
                          </div>
                          {mentor.studentIds.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-semibold text-gray-600 mb-2">Assigned Students:</p>
                              <div className="flex flex-wrap gap-2">
                                {mentor.studentIds.map(studentId => {
                                  const student = students.find(s => s.id === studentId);
                                  return student ? (
                                    <Badge key={studentId} variant="outline" className="text-xs border-gray-300">
                                      {student.name}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Mentor Tab */}
          <TabsContent value="add-mentor">
            <Card className="max-w-2xl mx-auto border-gray-200">
              <CardHeader className="border-b">
                <CardTitle className="text-gray-900">Add New Mentor</CardTitle>
                <CardDescription>Create a mentor account manually</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mentor-name">Full Name *</Label>
                    <Input
                      id="mentor-name"
                      placeholder="Enter mentor name"
                      value={newMentor.name}
                      onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mentor-email">Email Address *</Label>
                    <Input
                      id="mentor-email"
                      type="email"
                      placeholder="Enter email address"
                      value={newMentor.email}
                      onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mentor-password">Password *</Label>
                    <Input
                      id="mentor-password"
                      type="password"
                      placeholder="Create password"
                      value={newMentor.password}
                      onChange={(e) => setNewMentor({ ...newMentor, password: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mentor-department">Department</Label>
                    <Input
                      id="mentor-department"
                      placeholder="e.g., Computer Science"
                      value={newMentor.department}
                      onChange={(e) => setNewMentor({ ...newMentor, department: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mentor-designation">Designation</Label>
                    <Input
                      id="mentor-designation"
                      placeholder="e.g., Associate Professor"
                      value={newMentor.designation}
                      onChange={(e) => setNewMentor({ ...newMentor, designation: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <Button onClick={handleAddMentor} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus className="size-4" />
                    Add Mentor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reset Password Tab */}
          <TabsContent value="reset">
            <Card className="max-w-2xl mx-auto border-gray-200">
              <CardHeader className="border-b">
                <CardTitle className="text-gray-900">Reset Password</CardTitle>
                <CardDescription>Reset password for students and mentors</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label>User Role</Label>
                    <Select value={resetRole} onValueChange={(v) => setResetRole(v as 'student' | 'mentor')}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter user email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <Button onClick={handleResetPassword} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Key className="size-4" />
                    Reset Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Auto Allocation Dialog */}
      <Dialog open={showAllocationDialog} onOpenChange={setShowAllocationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Automatic Student Allocation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Allocation Method</Label>
              <Select value={autoAllocationType} onValueChange={(v: any) => setAutoAllocationType(v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Equal Distribution</span>
                      <span className="text-xs text-gray-600">Distribute students evenly across mentors</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="cgpa">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">By CGPA</span>
                      <span className="text-xs text-gray-600">Priority to students with lower CGPA</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="name">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Alphabetical</span>
                      <span className="text-xs text-gray-600">Allocate in alphabetical order</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• {unallocatedStudents.length} students to allocate</p>
                <p>• {mentors.length} mentors available</p>
                <p>• ~{Math.ceil(unallocatedStudents.length / (mentors.length || 1))} students per mentor</p>
              </div>
            </div>

            <Button onClick={handleAutoAllocate} className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Zap className="size-4" />
              Allocate Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
