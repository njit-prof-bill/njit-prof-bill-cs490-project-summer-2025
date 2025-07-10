"use client";

const reviews = [
  { quote: "I love how easy it was to create my resume!", name: "Anna G." },
  { quote: "Best resume builder I've tried so far.", name: "Tom H." },
  { quote: "The templates look fantastic and professional.", name: "Lisa K." },
  { quote: "It helped me land three interviews in a week!", name: "James R." },
  { quote: "Very intuitive and fast. Highly recommended.", name: "Karen T." },
  { quote: "My resume finally stands out thanks to Kaizo.", name: "Mark V." },
  { quote: "Clean design and simple to use.", name: "Nina B." },
  { quote: "I had my resume ready in 10 minutes!", name: "Oscar W." },
  { quote: "I got compliments on my resume format.", name: "Dana P." },
  { quote: "An essential tool for job seekers.", name: "Sam C." },
];

export default function Testimonials() {
  return (
    <section className="w-full py-16 px-4 bg-sky-50 overflow-hidden">
      <h2 className="text-3xl font-semibold text-center mb-8 text-gray-900">
        What Our Users Say
      </h2>
      <div className="relative w-full">
        <div className="flex w-max animate-marquee gap-4">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 p-4 bg-white border border-gray-200 rounded shadow-sm"
            >
              <p className="italic mb-2 text-gray-700">“{review.quote}”</p>
              <p className="font-medium text-gray-900">— {review.name}</p>
            </div>
          ))}
          {reviews.map((review, i) => (
            <div
              key={`duplicate-${i}`}
              className="flex-shrink-0 w-72 p-4 bg-white border border-gray-200 rounded shadow-sm"
            >
              <p className="italic mb-2 text-gray-700">“{review.quote}”</p>
              <p className="font-medium text-gray-900">— {review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
