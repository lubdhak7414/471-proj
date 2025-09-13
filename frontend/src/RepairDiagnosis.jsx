import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './sections/navbar';
import Footer from './sections/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, Brain, Clock, AlertTriangle, Wrench, DollarSign, Shield } from 'lucide-react';

export function RepairDiagnosis() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [error, setError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL; // <-- Add this line

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 3) {
      setError('You can upload a maximum of 3 images total.');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" is too large. Image size should be less than 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDiagnosis = async () => {
    if (!description.trim() && images.length === 0) {
      setError('Please provide either a description or upload images');
      return;
    }

    setLoading(true);
    setError('');
    setDiagnosis(null);

    try {
      const payload = { description: description.trim() };
      if (images.length > 0) payload.images = images;

      const response = await fetch(`${apiUrl}/diagnosis`, { // <-- Use backticks and apiUrl variable
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to get diagnosis');

      setDiagnosis(data.diagnosis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'emergency': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'diy': return 'bg-green-100 text-green-800';
      case 'professional required': return 'bg-orange-100 text-orange-800';
      case 'specialist required': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBookService = () => {
    navigate('/service-booking', {
      state: { diagnosis, description }
    });
  };

  return (
    <div className="text-foreground font-inter min-h-screen">
      <Navbar />
      <div className="w-full max-w-4xl mx-auto py-8 p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              AI Repair Diagnosis
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Get instant AI-powered diagnosis for your repair needs. Describe the issue or upload photos for accurate assessment.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Describe Your Problem
              </CardTitle>
              <CardDescription>
                Provide details about the issue you're experiencing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="problem-description" className="block text-sm font-medium mb-2">
                  Problem Description
                </label>
                <Textarea
                  id="problem-description"
                  placeholder="Describe the problem in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="image-upload" className="block text-sm font-medium mb-2">
                  Upload Images (Optional)
                </label>
                <div className="space-y-4">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500">
                    Upload up to 3 images (max 5MB each) for better diagnosis
                  </p>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Problem visual aid ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleDiagnosis}
                disabled={loading || (!description.trim() && images.length === 0)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Get AI Diagnosis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Diagnosis Results
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your repair issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {diagnosis ? (
                <div className="space-y-6">
                  {/* Main Diagnosis */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Diagnosis</h3>
                    <p className="text-blue-800">{diagnosis.diagnosis}</p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Estimated Cost</p>
                        <p className="font-medium">{diagnosis.estimatedCost?.range}</p>
                        <p className="text-xs text-gray-400 whitespace-pre-line">{diagnosis.estimatedCost?.notes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Time Required</p>
                        <p className="font-medium">
                          DIY: {diagnosis.estimatedTime?.diy} <br />
                          Pro: {diagnosis.estimatedTime?.professional}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getUrgencyColor(diagnosis.urgency)}>
                      {diagnosis.urgency} Priority
                    </Badge>
                    <Badge variant="outline" className={getDifficultyColor(diagnosis.difficulty)}>
                      {diagnosis.difficulty}
                    </Badge>
                  </div>

                  {/* Required Items */}
                  {diagnosis.requiredItems && (
                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Wrench className="h-4 w-4" />
                        Required Tools/Parts
                      </h4>
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded space-y-2">
                        <div>
                          <strong>Tools:</strong>
                          <ul className="list-disc list-inside ml-4">
                            {diagnosis.requiredItems?.tools?.map((tool, i) => (
                              <li key={`tool-${i}`}>{tool}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Parts:</strong>
                          <ul className="list-disc list-inside ml-4">
                            {diagnosis.requiredItems?.parts?.map((part, i) => (
                              <li key={`part-${i}`}>{part}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Safety Concerns */}
                  {diagnosis.safetyConcerns && (
                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        Safety Concerns
                      </h4>
                      <ul className="list-disc text-sm text-gray-700 bg-red-50 p-3 rounded border border-red-200 ml-4 space-y-1">
                        {diagnosis.safetyConcerns.map((item, i) => (
                          <li key={`safety-${i}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preventive Tips */}
                  {diagnosis.preventiveTips && (
                    <div>
                      <h4 className="font-medium mb-2">Prevention Tips</h4>
                      <ul className="list-disc text-sm text-gray-700 bg-green-50 p-3 rounded border border-green-200 ml-4 space-y-1">
                        {diagnosis.preventiveTips.map((tip, i) => (
                          <li key={`tip-${i}`}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  <Button
                    onClick={handleBookService}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Book Professional Service
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Upload images or describe your problem to get AI diagnosis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
