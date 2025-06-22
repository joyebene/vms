'use client';

import AppBar from '@/components/AppBar';
import { useEffect, useState } from 'react';
import { trainingAPI, Training } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

type SelectedAnswersMap = Record<number, string>;

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, SelectedAnswersMap>>({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});
  const [scores, setScores] = useState<Record<number, number>>({});
  const [signedBooks, setSignedBooks] = useState<string[]>([]);


  const { token } = useAuth();

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const response = await trainingAPI.getAllTrainings(token);
        setTrainings(response);
      } catch (error) {
        console.error('Failed to fetch training content:', error);
      }
    };

    if (token) {
      fetchTrainings();
    }
  }, [token]);

  const handleOptionChange = (trainingIndex: number, questionIndex: number, selectedOption: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [trainingIndex]: {
        ...prev[trainingIndex],
        [questionIndex]: selectedOption,
      },
    }));
  };

  const handleQuizSubmit = async (trainingIndex: number) => {
    setShowResults((prev) => ({ ...prev, [trainingIndex]: true }));

    const training = trainings[trainingIndex];
    const quizQuestions = training.questions || [];
    const selected = selectedAnswers[trainingIndex] || {};
    let correct = 0;

    quizQuestions.forEach((q, i) => {
      const selectedOption = selected[i];
      const correctOption = q.options[q.answer];
      if (selectedOption === correctOption) {
        correct++;
      }
    });


    const total = quizQuestions.length;
    const percentage = Math.round((correct / total) * 100);
    setScores((prev) => ({ ...prev, [trainingIndex]: percentage }));

    // Save to backend
    try {
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: selected,
          score: percentage,
          trainingId: training._id,
        }),
      });
    } catch (error) {
      console.error('Failed to submit quiz results:', error);
    }
  };

  const handleSignBook = (bookName: string) => {
    if (!signedBooks.includes(bookName)) {
      setSignedBooks([...signedBooks, bookName]);
    }
  };


  const passedAnyTraining = Object.values(scores).some(score => score >= 70);

  const handleRedoTraining = () => {
    setSelectedAnswers({});
    setShowResults({});
    setScores({});
  };



  return (
    <div>
      <AppBar />
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-center mb-8">Training Center</h1>

        {trainings.length === 0 && <p className="text-center text-gray-600">No trainings available yet.</p>}

        {trainings.map((training, index) => (
          <div key={training._id} className="space-y-8">

            {/* Videos */}
            <section className="bg-white border rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">{training.title} - Videos</h2>
              {training.videos?.length ? (
                <ul className="space-y-6">
                  {training.videos.map((video, i) => (
                    <li key={i}>
                      <p className="text-sm md:text-lg font-medium mb-2 text-gray-700">{video.name}</p>
                      <div className="w-full h-40 mt-6">
                        <video controls className="w-full rounded-lg shadow-md h-40">
                          <source src={video.url} type="video/mp4" />
                        </video>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No videos available for this training.</p>
              )}
            </section>

            {/* Books */}
            <section className="bg-white border rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">{training.title} - Books</h2>
              {training.books?.length ? (
                <ul className="space-y-6">
                  {training.books.map((book, i) => (
                    <li key={i}>
                      <p className="text-lg font-medium text-gray-700 mb-2">{book.name}</p>
                      <div className="flex flex-wrap gap-4">
                        <a href={book.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          📖 Read Book
                        </a>
                        <a href={book.url} download className="text-green-600 hover:underline">
                          📥 Download Book
                        </a>
                        <button onClick={() => handleSignBook(book.name)} className="text-purple-600 hover:underline">
                          ✍️ Sign Book
                        </button>
                      </div>
                      {signedBooks.includes(book.name) && (
                        <p className="text-sm text-gray-500 mt-1 italic">You have signed this book.</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No books available for this training.</p>
              )}
            </section>

            {/* Quiz */}
            <section className="bg-white border rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">{training.title} - Quiz</h2>
              {training.questions?.length ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleQuizSubmit(index);
                  }}
                  className="space-y-6"
                >
                  {training.questions.map((q, i) => (
                    <div key={i}>
                      <p className="font-medium text-lg mb-3">{i + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((option, j) => (
                          <label key={j} className="block text-gray-700">
                            <input
                              type="radio"
                              name={`training-${index}-question-${i}`}
                              value={option}
                              checked={selectedAnswers[index]?.[i] === option}
                              onChange={() => handleOptionChange(index, i, option)}
                              className="mr-2"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                      {showResults[index] && (
                        <p className={`mt-2 font-medium ${q.options[q.answer] === selectedAnswers[index]?.[i] ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {q.options[q.answer] === selectedAnswers[index]?.[i]
                            ? '✅ Correct'
                            : `❌ Correct answer: ${q.options[q.answer]}`}
                        </p>
                      )}

                    </div>
                  ))}
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition">
                    Submit Quiz
                  </button>
                  {scores[index] !== undefined && (
                    <p className="mt-4 text-lg font-bold text-center text-blue-600">
                      Your Score: {scores[index]}% 🎉
                    </p>
                  )}
                </form>
              ) : (
                <p className="text-sm text-gray-500">No quiz available for this training.</p>
              )}
            </section>
          </div>
        ))}


        <div className="text-center mt-10">
          {passedAnyTraining ? (
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
            >
              🎉 Finish
            </Link>
          ) : (
            <button
              type="button"
              className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); handleRedoTraining() }}
            >
              🔁 Redo Training
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
