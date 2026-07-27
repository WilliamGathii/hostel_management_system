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
    <PageContainer className="max-w-5xl">
      <PageHeader
        actions={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-card bg-periwinkle-light px-4 py-2.5 text-sm font-semibold text-primary hover:bg-periwinkle focus-visible:outline-primary"
            to="/admin/students"
          >
            <LuArrowLeft aria-hidden="true" className="size-4" />
            Back to students
          </Link>
        }
        description="Create a student login and hostel profile."
        title="Add Student"
      />

      <Card>
        <div className="mb-6">
          <p className="text-xs font-semibold text-information">
            New account
          </p>
          <h2 className="mt-1 text-lg font-bold text-text">
            Student information
          </h2>
          <p className="mt-1 text-sm text-muted">
            New accounts use the Student role and active status.
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
