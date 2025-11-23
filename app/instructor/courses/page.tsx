export default function InstructorCoursesPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Courses</h2>
      <ul className="space-y-4">
        <li className="p-4 bg-white rounded-lg shadow">📱 Flutter App Development</li>
        <li className="p-4 bg-white rounded-lg shadow">📊 Data Science Foundations</li>
        <li className="p-4 bg-white rounded-lg shadow">💻 Frontend Development</li>
      </ul>
      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        + Add New Course
      </button>
    </div>
  );
}
