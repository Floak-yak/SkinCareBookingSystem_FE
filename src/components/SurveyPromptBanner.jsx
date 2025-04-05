import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FaSpa, FaTimes } from 'react-icons/fa';
import '../styles/SurveyPromptBanner.css';
import surveyApi from '../api/surveyApi';

const SurveyPromptBanner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Check if we should show the banner
    const checkSurveyStatus = async () => {
      try {
        const dontAskAgain = localStorage.getItem('dontAskSurveyAgain');
        const lastPrompt = localStorage.getItem('lastSurveyPrompt');
        
        // If user explicitly said don't ask again, respect that
        if (dontAskAgain === 'true') {
          return;
        }
        
        // Don't show too frequently - only once per day
        if (lastPrompt) {
          try {
            const lastPromptDate = new Date(parseInt(lastPrompt));
            const currentDate = new Date();
            // Check if it's been less than a day
            if (currentDate - lastPromptDate < 24 * 60 * 60 * 1000) {
              return;
            }
          } catch (parseError) {
            console.warn('Error parsing last prompt date:', parseError);
            // Continue showing the banner if we can't parse the date
          }
        }
        
        // If user is logged in, check their survey history
        if (user) {
          try {
            const historyResponse = await surveyApi.getUserSurveyHistory();
            const surveyHistory = historyResponse.data;
            
            // If they've taken a survey in the last 30 days, don't show the banner
            if (surveyHistory && surveyHistory.length > 0) {
              const mostRecentSurvey = surveyHistory[0]; // Assuming sorted by date
              const surveyDate = new Date(mostRecentSurvey.completedDate);
              const currentDate = new Date();
              const daysSinceLastSurvey = Math.floor((currentDate - surveyDate) / (24 * 60 * 60 * 1000));
              
              if (daysSinceLastSurvey < 30) {
                return; // Don't show if they've taken a survey recently
              }
            }
          } catch (error) {
            console.warn('Could not fetch survey history:', error);
          }
        }
        
        // Show the banner after 5 seconds of being on the page
        const timer = setTimeout(() => {
          setVisible(true);
          // Update the last prompt timestamp
          try {
            localStorage.setItem('lastSurveyPrompt', Date.now().toString());
          } catch (storageError) {
            console.warn('Could not save last prompt time:', storageError);
          }
        }, 5000);
        
        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error in survey prompt logic:', error);
        // Don't show the banner if there's an error
        return;
      }
    };
    
    checkSurveyStatus();
  }, [user]);
  
  const handleTakeSurvey = () => {
    navigate('/survey');
    setVisible(false);
  };
  
  const handleClose = () => {
    setVisible(false);
  };
  
  const handleDontAskAgain = () => {
    try {
      localStorage.setItem('dontAskSurveyAgain', 'true');
      setVisible(false);
    } catch (error) {
      console.warn('Could not save preference:', error);
      setVisible(false);
    }
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <div className="survey-prompt-banner">
      <div className="survey-prompt-content">
        <div className="survey-prompt-icon">
          <FaSpa />
        </div>
        <div className="survey-prompt-text">
          <h3>Discover Your Perfect Skin Care Routine</h3>
          <p>Take our quick skin analysis survey to get personalized product recommendations!</p>
        </div>
        <div className="survey-prompt-actions">
          <button className="take-survey-button" onClick={handleTakeSurvey}>
            Take Survey
          </button>
          <button className="dont-ask-button" onClick={handleDontAskAgain}>
            Don't Ask Again
          </button>
        </div>
        <button className="close-button" onClick={handleClose}>
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default SurveyPromptBanner; 