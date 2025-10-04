import React, {useState, useEffect} from 'react';
import axios from 'axios';
import AddReview from './components/AddReview';
import ReviewList from './components/ReviewList';

export default function App() {
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchReviews = async ({ company, startDate, endDate, source }) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (company) params.append('search', company);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (source) params.append('source', source);
      const res = await axios.get(`http://localhost:5000/reviews?${params.toString()}`);
      setReviews(res.data);
    } catch(e){
      console.error(e);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (form) => {
    fetchReviews(form);
  };

  return (
    <div style={{maxWidth:900, margin:'20px auto', fontFamily:'Arial, sans-serif', padding:20}}>
      <h1>MERN Reviews</h1>
      <AddReview onSearch={handleSearch} />
      {hasSearched && loading && (
        <div style={{textAlign:'center', margin:'40px 0'}}>
          <span style={{fontSize:20, color:'#3182ce'}}>Loading reviews...</span>
        </div>
      )}
      {hasSearched && !loading && <ReviewList reviews={reviews} />}
    </div>
  );
}
