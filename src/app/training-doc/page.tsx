
export default function TrainingPage() {
  const videos = [
    {
      name: 'Safety Training Video',
      url: '/videos/safety-training.mp4',
    },
    {
      name: 'Equipment Handling Guide',
      url: '/videos/equipment-handling.mp4',
    },
  ];

  const books = [
    {
      name: 'Fire Drill Handbook',
      url: '/books/fire-drill-handbook.pdf',
    },
    {
      name: 'Safety Manual', 
      url: '/books/safety-manual.pdf',
    },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Training Center</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Course Videos */}
        <div className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">Course Videos</h2>
          <ul className="mt-4 space-y-4">
            {videos.map((video, index) => (
              <li key={index}>
                <p className="font-medium mb-1">{video.name}</p>
                <video controls className="w-full rounded">
                  <source src={video.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </li>
            ))}
          </ul>
        </div>

        {/* Course Books */}
        <div className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">Books</h2>
          <ul className="mt-4 space-y-2">
            {books.map((book, index) => (
              <li key={index} className="flex flex-col">
                <span className="font-medium mb-1">{book.name}</span>
                <div className="flex gap-4">
                  <a
                    href={book.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Read Book
                  </a>
                  <a
                    href={book.url}
                    download={book.name}
                    className="text-green-600 underline"
                  >
                    Download Book
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
