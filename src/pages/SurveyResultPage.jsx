import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SurveyResultPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaCheck, FaExclamationTriangle, FaStar, FaArrowLeft } from 'react-icons/fa';
import { Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import surveyApi from '../api/surveyApi';
import useAuth from '../hooks/useAuth';

const SurveyResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [surveyResult, setSurveyResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [surveyHistory, setSurveyHistory] = useState([]);
  const [showDontAskAgain, setShowDontAskAgain] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Get the survey ID from URL params
        const params = new URLSearchParams(location.search);
        const surveyId = params.get('id');

        if (!surveyId) {
          // Try to get results from localStorage (file-based survey)
          try {
            const storedResults = localStorage.getItem('surveyResults');
            if (storedResults) {
              const parsedResults = JSON.parse(storedResults);
              setSurveyResult({
                skinType: 'Not specified',
                skinTypeDescription: 'Based on your answers, we\'ve analyzed your skin profile.',
                skinConcerns: [],
                recommendedRoutine: null,
                resultText: parsedResults.question || 'No detailed results available.'
              });
              
              // Clear localStorage after use
              localStorage.removeItem('surveyResults');
              setLoading(false);
              return;
            }
          } catch (error) {
            console.warn('Error getting stored survey results:', error);
          }
          
          setError("Survey ID not found. Please complete the survey first.");
          setLoading(false);
          return;
        }

        // Fetch the survey result using our API
        const response = await surveyApi.getSurveyResultDetails(surveyId);
        
        setSurveyResult(response.data);
        
        // Fetch recommended products based on skin type
        if (response.data.skinType) {
          try {
            const productsResponse = await surveyApi.getRecommendedProducts(response.data.skinType);
            setRecommendations(productsResponse.data);
          } catch (productErr) {
            console.warn("Could not fetch recommended products:", productErr);
          }
        }
        
        // Fetch user's survey history if logged in
        if (user) {
          try {
            const historyResponse = await surveyApi.getUserSurveyHistory();
            setSurveyHistory(historyResponse.data);
          } catch (historyErr) {
            console.warn("Could not fetch survey history:", historyErr);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching survey results:", err);
        setError("Failed to load survey results. Please try again later.");
        setLoading(false);
      }
    };

    fetchResults();
    
    // Check if user has opted out of survey prompts
    try {
      const dontAskAgain = localStorage.getItem('dontAskSurveyAgain');
      if (dontAskAgain === 'true') {
        setShowDontAskAgain(false);
      }
    } catch (error) {
      console.warn('Error getting preference:', error);
    }
  }, [location.search, user]);

  const handleBackToSurvey = () => {
    navigate('/survey');
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Function to render skin concerns section
  const renderSkinConcerns = () => {
    if (!surveyResult || !surveyResult.skinConcerns || !Array.isArray(surveyResult.skinConcerns) || surveyResult.skinConcerns.length === 0) {
      return <p>No specific skin concerns identified.</p>;
    }

    return (
      <div className="skin-concerns">
        <h4>Identified Skin Concerns:</h4>
        <ul>
          {surveyResult.skinConcerns.map((concern, index) => (
            <li key={index}>
              <FaExclamationTriangle className="concern-icon" /> {concern}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Function to render recommendations section
  const renderRecommendations = () => {
    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
      return <p>No specific product recommendations available at this time.</p>;
    }

    return (
      <div className="product-recommendations">
        {recommendations.map((product, index) => (
          <div className="product-card" key={index}>
            <div className="product-image">
              <img src={product.image || '/placeholder-product.jpg'} alt={product.name || 'Product'} />
            </div>
            <div className="product-info">
              <h5>{product.name || 'Unnamed Product'}</h5>
              <div className="product-rating">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < (product.rating || 0) ? "star-filled" : "star-empty"} />
                ))}
              </div>
              <p className="product-price">${product.price || 'Price not available'}</p>
              <p className="product-description">{product.description || 'No description available.'}</p>
              <button 
                className="view-product-btn" 
                onClick={() => handleViewProduct(product.id)}
                disabled={!product.id}
              >
                View Product
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Handle when user clicks "Don't ask again"
  const handleDontAskAgain = () => {
    try {
      localStorage.setItem('dontAskSurveyAgain', 'true');
      setShowDontAskAgain(false);
      toast.success("You won't be prompted to take the survey again.");
    } catch (error) {
      console.warn('Error saving preference:', error);
      toast.error("Could not save your preference. Please try again later.");
    }
  };
  
  // Allow users to reset their preference
  const handleResetPreference = () => {
    try {
      localStorage.removeItem('dontAskSurveyAgain');
      setShowDontAskAgain(true);
      toast.success("You can now be prompted to take the survey again.");
    } catch (error) {
      console.warn('Error removing preference:', error);
      toast.error("Could not update your preference. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="survey-result-loading">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Analyzing your skin care needs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="survey-result-error">
        <FaExclamationTriangle size={50} />
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button className="primary-button" onClick={handleBackToSurvey}>
          Return to Survey
        </button>
      </div>
    );
  }

  return (
    <div className="survey-result-page">
      <Header />
      
      <div className="survey-result-container">
        <button className="back-button" onClick={handleBackToSurvey}>
          <FaArrowLeft /> Back to Survey
        </button>
        
        <div className="result-header">
          <h2>Your Personalized Skin Care Analysis</h2>
          <p>Based on your answers, we've created a customized skin care profile just for you.</p>
        </div>
        
        <div className="result-card">
          <div className="skin-type-section">
            <h3>Your Skin Type</h3>
            <div className="skin-type-result">
              <div className="skin-type-icon">
                {/* Icon could be changed based on skin type */}
                <FaCheck className="skin-type-check" />
              </div>
              <div className="skin-type-details">
                <h4>{surveyResult?.skinType || 'Unknown'}</h4>
                <p>{surveyResult?.skinTypeDescription || 'Your skin type could not be determined. Please consult a dermatologist for a professional assessment.'}</p>
              </div>
            </div>
          </div>
          
          <div className="concerns-section">
            {renderSkinConcerns()}
          </div>
          
          <div className="recommendations-section">
            <h3>Recommended Products for Your Skin</h3>
            {renderRecommendations()}
          </div>
          
          <div className="routine-section">
            <h3>Suggested Skin Care Routine</h3>
            {surveyResult?.recommendedRoutine && Array.isArray(surveyResult.recommendedRoutine) && surveyResult.recommendedRoutine.length > 0 ? (
              <div className="routine-steps">
                {surveyResult.recommendedRoutine.map((step, index) => (
                  <div className="routine-step" key={index}>
                    <div className="step-number">{index + 1}</div>
                    <div className="step-details">
                      <h5>{step.title || `Step ${index + 1}`}</h5>
                      <p>{step.description || 'No description available.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No specific routine available. Consider consulting with our skin care experts for a personalized routine.</p>
            )}
          </div>
          
          <div className="book-consultation">
            <h3>Want More Personalized Advice?</h3>
            <p>Book a consultation with one of our skin care experts for a deeper analysis and personalized treatment plan.</p>
            <button 
              className="consultation-btn"
              onClick={() => navigate('/services')}
            >
              Book a Consultation
            </button>
          </div>
          
          <div className="survey-preferences">
            {showDontAskAgain ? (
              <button 
                className="dont-ask-again-btn"
                onClick={handleDontAskAgain}
              >
                Don't show survey prompts again
              </button>
            ) : (
              <button 
                className="reset-preference-btn"
                onClick={handleResetPreference}
              >
                Allow survey prompts
              </button>
            )}
          </div>
        </div>
        
        {user && surveyHistory && Array.isArray(surveyHistory) && surveyHistory.length > 0 && (
          <div className="survey-history-section">
            <h3>Your Survey History</h3>
            <p>You can view your previous skin analysis results below:</p>
            <div className="history-list">
              {surveyHistory.map((item, index) => {
                // Check if item and item.result exist
                if (!item || !item.result) return null;
                
                return (
                  <div key={index} className="history-item">
                    <div className="history-date">
                      {item.completedDate ? new Date(item.completedDate).toLocaleDateString() : 'Date not available'}
                    </div>
                    <div className="history-details">
                      <h4>Skin Type: {item.result.skinType || 'Unknown'}</h4>
                      <p>{item.result.resultText || 'No detailed results available.'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default SurveyResultPage; 