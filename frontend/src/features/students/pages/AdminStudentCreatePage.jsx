import { LuArrowLeft } from 'react-icons/lu';
import { Link, useNavigate } from 'react-router-dom';

import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StudentAccountForm } from '../components/StudentAccountForm';
import { createStudent } from '../services/student.service';

export function AdminStudentCreatePage() {
  const navigate = useNavigate();

  const submitStudent = async (studentData) => {
    const student = await createStudent(studentData);

    if (!student) {
      throw new Error(
        'The Student account could not be loaded after creation.'
      );
    }

    navigate(`/admin/students/${student.id}`, {
      replace: true,
      state: {
        notice: 'Student account created successfully.',
      },
    });
  };

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-card border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            to="/admin/students"
          >
            <LuArrowLeft aria-hidden="true" className="size-4" />
            Back to students
          </Link>
        }
        description="Create a Student login and hostel profile."
        title="Add Student"
      />

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-text">Student information</h2>
          <p className="mt-1 text-sm text-muted">
            The new account is created with the Student role and active status.
          </p>
        </div>
        <StudentAccountForm
          includePassword
          onCancel={() => navigate('/admin/students')}
          onSubmit={submitStudent}
          submitLabel="Create Student"
        />
      </Card>
    </PageContainer>
  );
}
