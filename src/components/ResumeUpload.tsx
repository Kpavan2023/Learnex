import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, User, Award, Briefcase, Target, TrendingUp, Star } from 'lucide-react';

interface ResumeUploadProps {
  onAnalysisComplete: (analysis: any) => void;
}

interface ATSAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  missingSkills: string[];
  formatIssues: string[];
  keywordDensity: number;
  experienceLevel: 'fresher' | 'experienced';
  domain?: string;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onAnalysisComplete }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'experience' | 'domain' | 'complete'>('idle');
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<'fresher' | 'experienced' | ''>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  const domains = [
    { id: 'web', name: 'Web Development', icon: '🌐', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'TypeScript'] },
    { id: 'mobile', name: 'Mobile Development', icon: '📱', skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Java', 'Dart', 'iOS', 'Android'] },
    { id: 'ai', name: 'AI/Machine Learning', icon: '🤖', skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Deep Learning', 'NLP'] },
    { id: 'data', name: 'Data Science', icon: '📊', skills: ['Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Statistics', 'Machine Learning', 'Data Visualization'] },
    { id: 'devops', name: 'DevOps', icon: '⚙️', skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Git', 'Linux', 'CI/CD', 'Terraform'] },
    { id: 'backend', name: 'Backend Development', icon: '🔧', skills: ['Java', 'Spring Boot', 'Python', 'Django', 'Node.js', 'PostgreSQL', 'Redis', 'Microservices'] },
    { id: 'frontend', name: 'Frontend Development', icon: '🎨', skills: ['React', 'Vue.js', 'Angular', 'JavaScript', 'CSS', 'SASS', 'Webpack', 'TypeScript'] },
    { id: 'fullstack', name: 'Full Stack Development', icon: '🚀', skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'Git', 'REST APIs', 'GraphQL'] }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    
    // Simulate file upload
    setTimeout(() => {
      setUploadStatus('experience');
    }, 1500);
  };

  const handleExperienceSelect = (level: 'fresher' | 'experienced') => {
    setExperienceLevel(level);
    if (level === 'experienced') {
      setUploadStatus('domain');
    } else {
      setUploadStatus('analyzing');
      analyzeFresherResume();
    }
  };

  const handleDomainSelect = (domain: string) => {
    setSelectedDomain(domain);
    setUploadStatus('analyzing');
    analyzeExperiencedResume(domain);
  };

  const analyzeFresherResume = () => {
    setTimeout(() => {
      // Fresher scores: 45-65 range (max 65)
      const baseScore = Math.floor(Math.random() * 21) + 45; // 45-65
      
      const mockAnalysis: ATSAnalysis = {
        score: baseScore,
        experienceLevel: 'fresher',
        strengths: [
          'Clear educational background mentioned',
          'Good project descriptions provided',
          'Relevant coursework highlighted',
          'Contact information is complete'
        ],
        weaknesses: [
          'Limited professional experience',
          'Missing industry-specific keywords',
          'Needs more technical skills showcase',
          'Lacks quantified achievements'
        ],
        recommendations: [
          'Add more personal/academic projects with detailed descriptions',
          'Include relevant certifications (free online courses)',
          'Highlight programming languages and tools used',
          'Add internship or volunteer experience if available',
          'Include soft skills with specific examples',
          'Use action verbs to describe achievements',
          'Add GitHub profile link with active repositories',
          'Include relevant technical skills section'
        ],
        missingSkills: [
          'Version Control (Git)',
          'Database Management',
          'Web Development Frameworks',
          'Problem-solving examples',
          'Team collaboration tools',
          'Basic cloud platforms knowledge'
        ],
        formatIssues: [
          'Use consistent formatting throughout',
          'Add contact information prominently at top',
          'Include LinkedIn profile URL',
          'Use bullet points for better readability',
          'Ensure proper spacing between sections',
          'Use standard section headings'
        ],
        keywordDensity: Math.floor(Math.random() * 21) + 35 // 35-55%
      };
      
      setAnalysis(mockAnalysis);
      setUploadStatus('complete');
      onAnalysisComplete(mockAnalysis);
    }, 2500);
  };

  const analyzeExperiencedResume = (domain: string) => {
    setTimeout(() => {
      const selectedDomainData = domains.find(d => d.id === domain);
      // Experienced scores: 60-85 range (max 85, rare cases)
      const baseScore = Math.floor(Math.random() * 26) + 60; // 60-85
      
      const mockAnalysis: ATSAnalysis = {
        score: baseScore,
        experienceLevel: 'experienced',
        domain: domain,
        strengths: [
          'Strong professional experience demonstrated',
          'Relevant technical skills for the domain',
          'Quantified achievements mentioned',
          'Industry-specific keywords present'
        ],
        weaknesses: [
          'Missing some trending technologies',
          'Could improve keyword optimization',
          'Needs more leadership examples',
          'Some technical skills need updating'
        ],
        recommendations: [
          `Add more ${selectedDomainData?.name} specific keywords`,
          'Include metrics and quantified results for all achievements',
          'Highlight leadership and mentoring experience',
          'Add recent certifications in trending technologies',
          'Include cloud technologies experience',
          'Showcase problem-solving abilities with examples',
          'Add contributions to open source projects',
          'Include speaking/conference experience if any'
        ],
        missingSkills: selectedDomainData?.skills.slice(4, 7) || [],
        formatIssues: [
          'Optimize for ATS scanning with standard fonts',
          'Use standard section headings (Experience, Skills, etc.)',
          'Avoid graphics, tables, and complex formatting',
          'Include relevant keywords naturally in context',
          'Ensure consistent date formatting',
          'Use reverse chronological order for experience'
        ],
        keywordDensity: Math.floor(Math.random() * 21) + 60 // 60-80%
      };
      
      setAnalysis(mockAnalysis);
      setUploadStatus('complete');
      onAnalysisComplete(mockAnalysis);
    }, 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 55) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 55) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">ATS Resume Analysis</h2>
        <p className="text-gray-600">Upload your resume for AI-powered ATS compatibility analysis and personalized recommendations</p>
      </div>

      {uploadStatus === 'idle' && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Upload Your Resume</h3>
          <p className="text-gray-500 mb-6">Get detailed ATS analysis and improvement suggestions</p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 inline-flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Choose Resume File
            </span>
          </label>
          <p className="text-sm text-gray-500 mt-4">Supported formats: PDF, DOC, DOCX</p>
        </div>
      )}

      {uploadStatus === 'uploading' && (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 text-blue-600 mb-4">
            <Upload className="w-6 h-6 animate-bounce" />
            <span className="font-medium text-lg">Uploading your resume...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 w-2/3" />
          </div>
          <p className="text-gray-600">Please wait while we process your file</p>
        </div>
      )}

      {uploadStatus === 'experience' && (
        <div className="space-y-6">
          <div className="text-center">
            <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-4">What's your experience level?</h3>
            <p className="text-gray-600 mb-6">This helps us provide more accurate analysis and recommendations</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => handleExperienceSelect('fresher')}
              className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-6 hover:border-green-400 transition-all duration-300 text-left hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-8 h-8 text-green-600" />
                <h4 className="text-xl font-bold text-green-800">Fresher</h4>
              </div>
              <p className="text-green-700 mb-3">0-2 years of experience, recent graduate, or career starter</p>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Entry-level position focused analysis</li>
                <li>• Educational background emphasis</li>
                <li>• Project and internship highlights</li>
                <li>• Skills development recommendations</li>
              </ul>
            </button>
            
            <button
              onClick={() => handleExperienceSelect('experienced')}
              className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 transition-all duration-300 text-left hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-8 h-8 text-blue-600" />
                <h4 className="text-xl font-bold text-blue-800">Experienced</h4>
              </div>
              <p className="text-blue-700 mb-3">2+ years of professional experience in the industry</p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Domain-specific analysis</li>
                <li>• Advanced skill requirements</li>
                <li>• Leadership and impact focus</li>
                <li>• Industry trend alignment</li>
              </ul>
            </button>
          </div>
        </div>
      )}

      {uploadStatus === 'domain' && (
        <div className="space-y-6">
          <div className="text-center">
            <Briefcase className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select your domain</h3>
            <p className="text-gray-600 mb-6">Choose your area of expertise for targeted analysis</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => handleDomainSelect(domain.id)}
                className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 hover:border-purple-400 transition-all duration-300 text-left hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{domain.icon}</div>
                  <h4 className="font-bold text-gray-800 mb-2">{domain.name}</h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {domain.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {uploadStatus === 'analyzing' && (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 text-yellow-600 mb-4">
            <AlertCircle className="w-6 h-6 animate-pulse" />
            <span className="font-medium text-lg">Analyzing ATS compatibility...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-2000 w-4/5" />
          </div>
          <p className="text-gray-600">Generating personalized recommendations based on your profile</p>
        </div>
      )}

      {uploadStatus === 'complete' && analysis && (
        <div className="space-y-6">
          {/* ATS Score */}
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${getScoreBg(analysis.score)}`}>
              <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">ATS Compatibility Score</h3>
            <p className="text-gray-600">
              {analysis.experienceLevel === 'fresher' 
                ? `Good start for a fresher! ${analysis.score >= 60 ? 'Above average score' : 'Room for improvement'}`
                : `${analysis.score >= 75 ? 'Excellent professional resume!' : analysis.score >= 65 ? 'Good professional resume with room for improvement' : 'Needs significant improvements for better ATS performance'}`
              }
            </p>
          </div>

          {/* Analysis Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-800">Areas to Improve</h3>
              </div>
              <ul className="space-y-2">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Skills */}
          {analysis.missingSkills.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">
                  {analysis.experienceLevel === 'fresher' ? 'Recommended Skills to Add' : `Missing ${selectedDomain} Skills`}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-800">Personalized Recommendations</h3>
            </div>
            <div className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-purple-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Format Issues */}
          {analysis.formatIssues.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl font-bold text-gray-800">Format Improvements</h3>
              </div>
              <ul className="space-y-2">
                {analysis.formatIssues.map((issue, index) => (
                  <li key={index} className="flex items-center gap-2 text-yellow-700">
                    <FileText className="w-4 h-4 text-yellow-500" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keyword Density */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Keyword Optimization</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Keyword Density</span>
                  <span className="text-sm font-medium text-gray-800">{analysis.keywordDensity}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      analysis.keywordDensity >= 60 ? 'bg-green-500' : 
                      analysis.keywordDensity >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysis.keywordDensity}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {analysis.keywordDensity >= 60 ? 'Good' : 
                   analysis.keywordDensity >= 40 ? 'Average' : 'Needs Work'}
                </p>
              </div>
            </div>
          </div>

          {/* Score Explanation */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-3">Score Explanation</h3>
            <div className="space-y-2 text-blue-700">
              {analysis.experienceLevel === 'fresher' ? (
                <>
                  <p>• <strong>Fresher Score Range:</strong> 45-65% (Your score: {analysis.score}%)</p>
                  <p>• <strong>Focus Areas:</strong> Educational background, projects, and skill development</p>
                  <p>• <strong>Next Steps:</strong> Build more projects, gain certifications, and add technical skills</p>
                </>
              ) : (
                <>
                  <p>• <strong>Experienced Score Range:</strong> 60-85% (Your score: {analysis.score}%)</p>
                  <p>• <strong>Focus Areas:</strong> Professional experience, leadership, and domain expertise</p>
                  <p>• <strong>Next Steps:</strong> Highlight achievements, add metrics, and showcase impact</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};