// Debug script to test rating data
console.log('Testing rating data...');

// Test the rating formatting function
const formatRating = (rating) => {
  if (!rating) return null;
  const value = rating.value || rating;
  const count = rating.votes_count || rating.count || 0;
  return { value: parseFloat(value), count };
};

// Test different rating formats
const testRatings = [
  // DataForSEO format
  { value: 4.5, votes_count: 123 },
  // Simple format
  4.2,
  // Alternative format
  { value: 3.8, count: 45 },
  // Null/undefined
  null,
  undefined,
  // Invalid
  { invalid: true }
];

console.log('Testing rating formats:');
testRatings.forEach((rating, index) => {
  const result = formatRating(rating);
  console.log(`Test ${index + 1}:`, { input: rating, output: result });
});

// Test actual API response structure
console.log('\nExpected DataForSEO rating structure:');
console.log({
  rating: {
    value: 4.5,
    rating_type: "Max5",
    votes_count: 123,
    rating_max: 5,
    count: 123
  }
});