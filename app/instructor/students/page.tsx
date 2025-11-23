export default function InstructorStudentsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Students</h2>
      <div className="space-y-3">
        <div className="p-4 bg-white rounded-lg shadow flex justify-between">
          <span>John Doe</span> <span className="text-sm text-gray-500">Flutter Course</span>
        </div>
        <div className="p-4 bg-white rounded-lg shadow flex justify-between">
          <span>Jane Smith</span> <span className="text-sm text-gray-500">Data Science</span>
        </div>
      </div>
    </div>
  );
}
