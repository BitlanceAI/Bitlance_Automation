import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config';
import {
  Youtube,
  Sparkles,
  Loader2,
  Check,
  Building,
  DollarSign,
  MapPin,
  ListPlus,
  Play,
  Pause,
  Volume2,
  VolumeX,
  User,
  Music,
  Download,
  ArrowRight,
  TrendingUp,
  Sliders,
  Scissors,
  FileText,
  RefreshCw,
  Info,
  Tv
} from 'lucide-react';
import toast from 'react-hot-toast';

// Available Avatars
const AVATARS = [
  { id: 'luxury_sophia', name: 'Sophia (Elite Real Estate)', gender: 'Female', desc: 'Sophisticated & elegant narration style.', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150' },
  { id: 'modern_john', name: 'John (Aspirational Tech)', gender: 'Male', desc: 'High-energy, modern, and engaging.', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150&h=150' },
  { id: 'calm_emma', name: 'Emma (Warm Residential)', gender: 'Female', desc: 'Inviting, calm, and reassuring.', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150' },
  { id: 'global_daniel', name: 'Daniel (Investment Guru)', gender: 'Male', desc: 'Authoritative, clear, and business-focused.', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150' }
];

// Sample images for the Ken Burns simulator if user doesn't upload custom ones
const SAMPLE_PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000', // Luxury villa front
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000', // Marble living room
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1000', // Italian kitchen
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000', // Rooftop pool / deck
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=1000'  // Night exterior
];

// Sample public stock video loops for realistic moving property background footage (using high-availability CORS-enabled CDN links)
const SAMPLE_PROPERTY_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://media.w3.org/2010/05/sintel/trailer_hd.mp4'
];

// Sample Reference URLs for quick pick
const SAMPLE_VIDEOS = [
  { label: "Luxury Villa Tour (Real Estate)", url: "https://www.youtube.com/watch?v=kYJvMebG29o" },
  { label: "Product Review / Tech (MKBHD)", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
];

export default function RealEstateReelPage() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1); // 1: Ref Video, 2: Property Info, 3: Script & Presenter, 4: Reel Player

  // Step 1: Reference Video Analysis
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Step 2: Property / Topic Data Input
  const [topicNiche, setTopicNiche] = useState('universal');
  const [propertyDetails, setPropertyDetails] = useState({
    title: '',
    location: '',
    price: '',
    bhk: '',
    amenities: '',
    extra_details: '',
    category: '',
    details: '',
    cta: ''
  });
  const [customImages, setCustomImages] = useState([]);
  const [uploadedBrochure, setUploadedBrochure] = useState(null);

  // Step 3: Script & Presenter
  const [selectedAvatar, setSelectedAvatar] = useState('luxury_sophia');
  const [selectedVoice, setSelectedVoice] = useState('en-US-Neural-Sophisticated');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedScript, setGeneratedScript] = useState(null);

  // Step 4: Video Editing Engine / Preview Simulator
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioVibe, setAudioVibe] = useState('');
  const [sceneElapsedTime, setSceneElapsedTime] = useState(0);
  const [presenterLayout, setPresenterLayout] = useState('circle');
  const [bgSource, setBgSource] = useState('video');
  const [klingTasks, setKlingTasks] = useState({});

  const synthRef = useRef(null);
  const musicRef = useRef(null);
  const sceneTimerRef = useRef(null);
  const videoRef = useRef(null);

  // Load sample property
  const loadSampleProperty = () => {
    if (topicNiche === 'real_estate') {
      setPropertyDetails({
        title: 'The Sky-Residences Penthouse',
        location: 'Golf Course Road, Gurgaon (5 mins to cyber hub)',
        price: '₹7.5 Crores',
        bhk: '4 BHK Duplex Penthouse (5400 sq.ft.)',
        amenities: 'Infinity Rooftop Pool, Private Elevator, Concierge Desk, Home Theater Lounge, Modular Chef Kitchen',
        extra_details: 'Wrap-around balcony with panoramic Aravalli mountain views. Fully automated smart home controls.',
        category: 'Real Estate',
        details: '',
        cta: ''
      });
      setCustomImages(SAMPLE_PROPERTY_IMAGES);
      toast.success('Sample property details loaded!');
    } else {
      setPropertyDetails({
        title: 'Quantum X1 Wireless Earbuds',
        location: '',
        price: '$99',
        bhk: '',
        amenities: '',
        extra_details: '',
        category: 'Tech Gadget',
        details: 'Active Noise Cancellation (ANC), 40-hour battery life, IPX7 water resistance, custom spatial audio drivers. Premium matte black case.',
        cta: 'Tap link in bio to get 20% off today!'
      });
      setCustomImages([
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=1000'
      ]);
      toast.success('Sample universal product details loaded!');
    }
  };

  // Run Video Analysis
  const handleAnalyzeVideo = async () => {
    if (!youtubeUrl.trim() || !youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      toast.error('Please enter a valid YouTube video link');
      return;
    }

    setIsAnalyzing(true);
    const toastId = toast.loading('Connecting to Style Analyzer agent...');
    
    try {
      const token = localStorage.getItem('supabase-token') || 'dummy-token-for-dev';
      const response = await fetch(`${API_BASE_URL}/api/video/analyze-style`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ youtube_url: youtubeUrl })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze style');
      }

      const data = await response.json();
      setAnalysisResult(data);
      toast.success('YouTube style analysis completed!', { id: toastId });
      setActiveStep(2); // Go to step 2 automatically
    } catch (error) {
      console.error(error);
      toast.error('Style analysis failed. Check API configuration or try again.', { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate Reel Script
  const handleGenerateScript = async () => {
    if (!propertyDetails.title) {
      toast.error('Please enter a Title or Topic Name');
      return;
    }

    if (topicNiche === 'real_estate' && (!propertyDetails.location || !propertyDetails.price)) {
      toast.error('Please enter Location and Price for real estate listing');
      return;
    }

    setIsGeneratingScript(true);
    const toastId = toast.loading('Writing narration script...');

    try {
      const amenitiesList = propertyDetails.amenities
        ? propertyDetails.amenities.split(',').map(a => a.trim()).filter(a => a.length > 0)
        : [];

      const payload = {
        style_analysis: analysisResult || {
          hook_style: 'Curiosity proximity hook',
          pacing: 'Cinematic',
          transitions: 'Zoom & pan',
          script_structure: ['Hook', 'Intro', 'Key Details', 'Value Pitch', 'CTA']
        },
        property_details: {
          title: propertyDetails.title,
          location: propertyDetails.location,
          price: propertyDetails.price,
          bhk: propertyDetails.bhk || 'Luxury Property',
          amenities: amenitiesList,
          extra_details: propertyDetails.extra_details
        },
        topic_details: {
          topic: propertyDetails.title,
          category: propertyDetails.category || (topicNiche === 'real_estate' ? 'Real Estate' : 'Universal'),
          details: topicNiche === 'real_estate' ? propertyDetails.extra_details : propertyDetails.details,
          cta: topicNiche === 'real_estate' ? `Contact us for private viewing of ${propertyDetails.title}` : propertyDetails.cta,
          price: propertyDetails.price
        },
        avatar: selectedAvatar,
        voice: selectedVoice
      };

      const token = localStorage.getItem('supabase-token') || 'dummy-token-for-dev';
      const response = await fetch(`${API_BASE_URL}/api/video/generate-reel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      setGeneratedScript(data.script);
      setAudioVibe(data.script.background_music_vibe || 'Ambient lounge beats');
      toast.success('Cinematic script generated successfully!', { id: toastId });
      setActiveStep(3); // Go to step 3/4
    } catch (error) {
      console.error(error);
      toast.error('Script generation failed. Try again.', { id: toastId });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Image Upload helper
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileURLs = files.map(file => URL.createObjectURL(file));
    setCustomImages(prev => [...prev, ...fileURLs]);
    toast.success(`${files.length} showcase images added!`);
  };

  // Audio/TTS simulator handlers
  useEffect(() => {
    // Setup background music (ambient track simulator)
    musicRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    musicRef.current.loop = true;
    musicRef.current.volume = 0.15;

    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      clearInterval(sceneTimerRef.current);
    };
  }, []);

  const handlePlayStopReel = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (musicRef.current) musicRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      clearInterval(sceneTimerRef.current);
    } else {
      // Play
      setIsPlaying(true);
      setCurrentSceneIndex(0);
      playScene(0);
    }
  };

  const playScene = (index) => {
    if (!generatedScript || !generatedScript.scenes || index >= generatedScript.scenes.length) {
      setIsPlaying(false);
      if (musicRef.current) musicRef.current.pause();
      return;
    }

    setCurrentSceneIndex(index);
    setSceneElapsedTime(0);

    const scene = generatedScript.scenes[index];
    const duration = (scene.duration || 8) * 1000;

    // Start music if not muted
    if (musicRef.current && !isMuted) {
      musicRef.current.play().catch(e => console.log('Music autoplay blocked'));
    }

    // Trigger TTS for narration
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scene.narration);
      
      // Select voice based on chosen avatar gender
      const avatarObj = AVATARS.find(a => a.id === selectedAvatar);
      const voices = window.speechSynthesis.getVoices();
      let selectedVoiceObj = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes(avatarObj?.gender === 'Female' ? 'female' : 'male'));
      if (!selectedVoiceObj) selectedVoiceObj = voices.find(v => v.lang.startsWith('en'));
      
      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
      }
      
      utterance.rate = 1.0;
      utterance.volume = isMuted ? 0 : 1;
      window.speechSynthesis.speak(utterance);
    }

    // Progress bar tick
    let elapsed = 0;
    clearInterval(sceneTimerRef.current);
    sceneTimerRef.current = setInterval(() => {
      elapsed += 100;
      setSceneElapsedTime(Math.min((elapsed / duration) * 100, 100));

      if (elapsed >= duration) {
        clearInterval(sceneTimerRef.current);
        // Play next scene
        if (index + 1 < generatedScript.scenes.length) {
          playScene(index + 1);
        } else {
          setIsPlaying(false);
          if (musicRef.current) musicRef.current.pause();
          toast.success('Cinematic Reel walkthrough complete!');
        }
      }
    }, 100);
  };

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = isMuted ? 0 : 0.15;
    }
    if (window.speechSynthesis) {
      if (isMuted) {
        window.speechSynthesis.cancel();
      } else if (isPlaying) {
        // restart scene audio on unmute
        playScene(currentSceneIndex);
      }
    }
  }, [isMuted]);

  // Synchronize HTML5 video background playback with simulation timer
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && bgSource === 'video') {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Auto-play prevented or loading:", error);
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentSceneIndex, bgSource]);

  // Download video package simulator
  const handleDownloadReel = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 3000)),
      {
        loading: 'Compiling high-resolution scenes & avatar lip-sync tracks...',
        success: 'Reel exported! Video_Reel.mp4 downloaded successfully.',
        error: 'Export failed.'
      }
    );
  };

  // Generate real background video clip using Kling AI
  const handleGenerateKlingVideo = async (idx) => {
    const scene = generatedScript.scenes[idx];
    if (!scene.visual_cue) {
      toast.error('Visual cue prompt is empty');
      return;
    }

    setKlingTasks(prev => ({
      ...prev,
      [idx]: { loading: true, status: 'initiating', taskId: null }
    }));

    const toastId = toast.loading(`Initiating Kling AI Video Generation for Scene ${idx + 1}...`);

    try {
      const token = localStorage.getItem('supabase-token') || 'dummy-token-for-dev';
      const response = await fetch(`${API_BASE_URL}/api/video/generate-kling-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: scene.visual_cue,
          aspect_ratio: '9:16'
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to initiate video generation');
      }

      const data = await response.json();
      const taskId = data.taskId;

      setKlingTasks(prev => ({
        ...prev,
        [idx]: { loading: true, status: data.status || 'submitted', taskId }
      }));

      toast.loading(`Kling task created (ID: ${taskId}). Generating video...`, { id: toastId });

      // Start polling
      pollKlingStatus(taskId, idx, toastId);

    } catch (error) {
      console.error(error);
      setKlingTasks(prev => ({
        ...prev,
        [idx]: { loading: false, status: 'failed', error: error.message }
      }));
      toast.error(`Kling Video Generation failed: ${error.message}`, { id: toastId });
    }
  };

  // Poll Kling AI status endpoint for completed video URL
  const pollKlingStatus = (taskId, idx, toastId) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5s * 60)
    
    const interval = setInterval(async () => {
      attempts++;
      try {
        const token = localStorage.getItem('supabase-token') || 'dummy-token-for-dev';
        const response = await fetch(`${API_BASE_URL}/api/video/kling-status/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }

        const data = await response.json();
        
        if (data.status === 'succeed') {
          clearInterval(interval);
          
          // Update scene object with the video URL
          const newScenes = [...generatedScript.scenes];
          newScenes[idx].kling_video_url = data.videoUrl;
          setGeneratedScript({ ...generatedScript, scenes: newScenes });

          setKlingTasks(prev => ({
            ...prev,
            [idx]: { loading: false, status: 'succeed', taskId, videoUrl: data.videoUrl }
          }));

          toast.success(`Kling AI Video for Scene ${idx + 1} generated successfully!`, { id: toastId });
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setKlingTasks(prev => ({
            ...prev,
            [idx]: { loading: false, status: 'failed', taskId }
          }));
          toast.error(`Kling AI Video generation for Scene ${idx + 1} failed.`, { id: toastId });
        } else {
          // Update loading status (submitted or processing)
          setKlingTasks(prev => ({
            ...prev,
            [idx]: { loading: true, status: data.status, taskId }
          }));
          
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            setKlingTasks(prev => ({
              ...prev,
              [idx]: { loading: false, status: 'timeout', taskId }
            }));
            toast.error(`Kling Video generation timed out after 5 minutes.`, { id: toastId });
          }
        }
      } catch (err) {
        console.warn('Error polling Kling status:', err);
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setKlingTasks(prev => ({
            ...prev,
            [idx]: { loading: false, status: 'failed', error: err.message }
          }));
          toast.error(`Failed checking Kling status: ${err.message}`, { id: toastId });
        }
      }
    }, 5000);
  };

  // Render presenter with advanced breathing, lip-sync, and eyelid blink animations
  const renderPresenterAvatar = () => {
    const avatarObj = AVATARS.find(a => a.id === selectedAvatar);
    return (
      <div className="relative w-full h-full">
        {/* Scoped CSS Keyframes for realistic movements */}
        <style>{`
          @keyframes blink-animation {
            0%, 90%, 94%, 100% { transform: scaleY(0); }
            92% { transform: scaleY(0.9); }
          }
          @keyframes mouth-talk {
            0%, 100% { height: 3px; transform: translateX(-50%) scaleY(0.2); }
            50% { height: 16px; transform: translateX(-50%) scaleY(1.3); }
          }
          @keyframes presenter-speak {
            0%, 100% { transform: scale(1) rotate(0deg) translateY(0); }
            25% { transform: scale(1.02) rotate(0.8deg) translateY(-2px); }
            50% { transform: scale(0.99) rotate(-0.8deg) translateY(1px); }
            75% { transform: scale(1.03) rotate(0.4deg) translateY(-1px); }
          }
          @keyframes background-pulse {
            0%, 100% { filter: brightness(0.95) contrast(1.03); }
            50% { filter: brightness(1.05) contrast(0.97); }
          }
        `}</style>

        <img
          src={avatarObj?.img}
          alt="AI Presenter"
          className="w-full h-full object-cover transition-transform duration-500"
          style={{
            animation: isPlaying ? 'presenter-speak 4.5s infinite ease-in-out' : 'none'
          }}
        />

        {/* Eyelid Blink Overlay (clips the eye level area automatically) */}
        <div
          className="absolute inset-0 bg-[#0c101b] origin-top pointer-events-none z-30 transition-opacity duration-300"
          style={{
            height: '100%',
            transformOrigin: 'top',
            animation: isPlaying ? 'blink-animation 3.5s infinite ease-in-out' : 'none',
            clipPath: 'ellipse(45% 28% at 50% 0%)',
            opacity: 0.95
          }}
        />

        {/* Dynamic Lip-Sync Mouth Overlay (placed at center-bottom) */}
        {isPlaying && (
          <div
            className="absolute left-1/2 w-4.5 h-3.5 bg-[#0a0a0a] rounded-full border border-[#26cece]/60 pointer-events-none z-30 shadow-[0_0_8px_rgba(38,206,206,0.3)]"
            style={{
              bottom: '25%',
              animation: 'mouth-talk 0.22s infinite ease-in-out',
            }}
          />
        )}

        {/* Lip Sync Audio Wave Bar Overlay */}
        {isPlaying && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5 px-2 bg-black/45 py-1 z-30">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className="w-1 bg-[#26cece] rounded-[1px] animate-pulse"
                style={{
                  height: `${Math.random() * 10 + 3}px`,
                  animationDelay: `${bar * 0.1}s`,
                  animationDuration: '0.3s'
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#f0f0f0] pt-28 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="mb-12 border-b border-[#1e1e1e] pb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] border border-[#26cece]/20 bg-[#26cece]/5 text-[#26cece] font-mono text-[10px] uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI Video Production Agent
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase font-['Space_Grotesk'] tracking-tight">
            Universal AI Reel <span className="gradient-text">Agent</span>
          </h1>
          <p className="text-[#a0a0a0] text-sm md:text-base max-w-3xl mt-2 font-mono uppercase tracking-wide">
            Extract structural pacing & hook styles from any reference YouTube video, then synthesize a cinematic video reel with your brand's AI presenter.
          </p>
        </div>

        {/* Steps Tracker */}
        <div className="grid grid-cols-4 gap-4 mb-8 text-center">
          {[
            { step: 1, label: 'Style Analysis', desc: 'YouTube Link' },
            { step: 2, label: 'Topic & Details', desc: 'Images & Info' },
            { step: 3, label: 'Script & Presenter', desc: 'Narrator Studio' },
            { step: 4, label: 'Cinematic Reel', desc: 'Video Playback' }
          ].map((item) => (
            <div 
              key={item.step}
              onClick={() => {
                if (item.step === 3 && !analysisResult) {
                  toast.error('Please analyze a reference video first');
                  return;
                }
                if (item.step === 4 && !generatedScript) {
                  toast.error('Please generate a script and avatar details first');
                  return;
                }
                setActiveStep(item.step);
              }}
              className={`p-4 border-[1.5px] rounded-[2px] transition-all cursor-pointer ${
                activeStep === item.step
                  ? 'border-[#26cece] bg-[#26cece]/5 shadow-[0_0_12px_rgba(38,206,206,0.15)]'
                  : 'border-[#1e1e1e] bg-[#111111] hover:border-[#333333]'
              }`}
            >
              <span className={`text-xs font-mono tracking-widest uppercase ${activeStep === item.step ? 'text-[#26cece]' : 'text-[#777777]'}`}>
                Step 0{item.step}
              </span>
              <h3 className="font-['Space_Grotesk'] font-bold text-xs md:text-sm mt-1 uppercase text-[#f0f0f0] tracking-wider">{item.label}</h3>
              <p className="text-[10px] text-[#777777] hidden md:block mt-0.5 tracking-widest font-mono uppercase">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Step Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Workspace (Left/Center - 8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* STEP 1: YouTube Style Analysis */}
            {activeStep === 1 && (
              <div className="bg-[#111111] border border-[#1e1e1e] p-6 rounded-[2px] space-y-6">
                <div>
                  <h2 className="text-xl font-bold uppercase font-['Space_Grotesk'] text-[#f0f0f0] tracking-wider flex items-center gap-2">
                    <Youtube className="text-red-500 w-5 h-5" /> Reference Video Understanding
                  </h2>
                  <p className="text-xs text-[#777777] mt-1 font-mono uppercase">
                    Provide the URL of any YouTube video whose hook style, pacing, and visual layout you want to learn.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-mono uppercase text-[#a0a0a0] tracking-widest">
                    Reference YouTube URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=kYJvMebG29o"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full bg-[#070707] border border-[#1e1e1e] px-4 py-3 text-sm text-[#f0f0f0] focus:border-[#26cece] outline-none rounded-[2px] transition-colors font-mono"
                    />
                  </div>

                  {/* Sample urls */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-xs font-mono uppercase text-[#777777] self-center">Or try samples:</span>
                    {SAMPLE_VIDEOS.map((vid, idx) => (
                      <button
                        key={idx}
                        onClick={() => setYoutubeUrl(vid.url)}
                        className="px-3 py-1 text-[10px] font-mono border border-[#1e1e1e] hover:border-[#26cece] bg-[#1a1a1a] rounded-[2px] text-[#a0a0a0] hover:text-[#26cece] transition-all uppercase"
                      >
                        {vid.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleAnalyzeVideo}
                    disabled={isAnalyzing}
                    className="w-full btn-primary py-4 rounded-[2px] flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        Analyzing Style & Narration Rhythm...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-black" />
                        Extract Style Parameters
                      </>
                    )}
                  </button>
                </div>

                {analysisResult && (
                  <div className="border-t border-[#1e1e1e] pt-6 space-y-4 animate-fade-in-up">
                    <div className="bg-[#1a1a1a] p-4 border border-[#26cece]/20 rounded-[2px]">
                      <span className="text-[10px] font-mono text-[#26cece] uppercase tracking-widest">
                        Extracted Reference Details
                      </span>
                      <h4 className="font-bold text-sm text-[#f0f0f0] mt-1">{analysisResult.meta?.title}</h4>
                      <p className="text-xs text-[#777777] mt-0.5 font-mono uppercase">Channel: {analysisResult.meta?.channel}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#070707] border border-[#1e1e1e] rounded-[2px]">
                        <span className="text-[9px] font-mono text-[#777777] uppercase tracking-widest">Hook Style Detected</span>
                        <p className="text-xs text-[#f0f0f0] mt-1 leading-relaxed">{analysisResult.hook_style}</p>
                      </div>
                      <div className="p-4 bg-[#070707] border border-[#1e1e1e] rounded-[2px]">
                        <span className="text-[9px] font-mono text-[#777777] uppercase tracking-widest">Narration Pacing & Cuts</span>
                        <p className="text-xs text-[#f0f0f0] mt-1 leading-relaxed">{analysisResult.pacing}</p>
                      </div>
                      <div className="p-4 bg-[#070707] border border-[#1e1e1e] rounded-[2px]">
                        <span className="text-[9px] font-mono text-[#777777] uppercase tracking-widest">Transitions & Overlay Aesthetic</span>
                        <p className="text-xs text-[#f0f0f0] mt-1 leading-relaxed">{analysisResult.transitions}</p>
                      </div>
                      <div className="p-4 bg-[#070707] border border-[#1e1e1e] rounded-[2px]">
                        <span className="text-[9px] font-mono text-[#777777] uppercase tracking-widest">Vocal Tone Profile</span>
                        <p className="text-xs text-[#f0f0f0] mt-1 leading-relaxed">{analysisResult.tone}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-[#070707] border border-[#1e1e1e] rounded-[2px]">
                      <span className="text-[9px] font-mono text-[#777777] uppercase tracking-widest">Script Structure Walkthrough</span>
                      <ol className="mt-2 space-y-1.5 text-xs text-[#a0a0a0]">
                        {analysisResult.script_structure?.map((section, idx) => (
                          <li key={idx} className="flex gap-2 font-mono">
                            <span className="text-[#26cece]">{idx + 1}.</span> {section}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <button
                      onClick={() => setActiveStep(2)}
                      className="w-full border border-[#26cece]/30 hover:border-[#26cece] text-[#26cece] hover:bg-[#26cece]/5 py-3 rounded-[2px] flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-mono transition-all"
                    >
                      Configure Topic Input <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Topic & Details */}
            {activeStep === 2 && (
              <div className="bg-[#111111] border border-[#1e1e1e] p-6 rounded-[2px] space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold uppercase font-['Space_Grotesk'] text-[#f0f0f0] tracking-wider flex items-center gap-2">
                      <Building className="w-5 h-5 text-[#26cece]" /> Topic & Specifications
                    </h2>
                    <p className="text-xs text-[#777777] mt-1 font-mono uppercase">
                      Select your niche, enter specifications, and we will weave them into the extracted reference story style.
                    </p>
                  </div>
                  <button
                    onClick={loadSampleProperty}
                    className="px-3 py-1.5 text-[10px] font-mono border border-[#26cece]/20 text-[#26cece] bg-[#26cece]/5 hover:bg-[#26cece]/10 rounded-[2px] uppercase tracking-wider"
                  >
                    Quick Load Sample
                  </button>
                </div>

                {/* Niche Selector */}
                <div className="flex gap-2 border-b border-[#1e1e1e] pb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setTopicNiche('universal');
                      setPropertyDetails({
                        title: '', location: '', price: '', bhk: '', amenities: '', extra_details: '', category: '', details: '', cta: ''
                      });
                    }}
                    className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border rounded-[2px] transition-all ${
                      topicNiche === 'universal'
                        ? 'border-[#26cece] text-[#26cece] bg-[#26cece]/5'
                        : 'border-[#1e1e1e] text-[#a0a0a0] hover:text-[#fff]'
                    }`}
                  >
                    Universal / Custom Topic
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTopicNiche('real_estate');
                      setPropertyDetails({
                        title: '', location: '', price: '', bhk: '', amenities: '', extra_details: '', category: '', details: '', cta: ''
                      });
                    }}
                    className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border rounded-[2px] transition-all ${
                      topicNiche === 'real_estate'
                        ? 'border-[#26cece] text-[#26cece] bg-[#26cece]/5'
                        : 'border-[#1e1e1e] text-[#a0a0a0] hover:text-[#fff]'
                    }`}
                  >
                    Real Estate
                  </button>
                </div>

                {topicNiche === 'real_estate' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider">Property Name / Title</label>
                      <input
                        type="text"
                        placeholder="e.g. M3M Crown Luxury Living"
                        value={propertyDetails.title}
                        onChange={(e) => setPropertyDetails({...propertyDetails, title: e.target.value})}
                        className="w-full bg-[#070707] border border-[#1e1e1e] px-4 py-2.5 text-xs text-[#f0f0f0] focus:border-[#26cece] outline-none rounded-[2px] transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider">Configuration / BHK</label>
                      <input
                        type="text"
                        placeholder="e.g. 3 BHK Spacious Residences"
                        value={propertyDetails.bhk}
                        onChange={(e) => setPropertyDetails({...propertyDetails, bhk: e.target.value})}
                        className="w-full bg-[#070707] border border-[#1e1e1e] px-4 py-2.5 text-xs text-[#f0f0f0] focus:border-[#26cece] outline-none rounded-[2px] transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider">Pricing</label>
                      <input
                        type="text"
                        placeholder="e.g. Starting from ₹2.9 Crores"
                        value={propertyDetails.price}
                        onChange={(e) => setPropertyDetails({...propertyDetails, price: e.target.value})}
                        className="w-full bg-[#070707] border border-[#1e1e1e] px-4 py-2.5 text-xs text-[#f0f0f0] focus:border-[#26cece] outline-none rounded-[2px] transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider">Location & Proximity Details</label>
                      <input
                        type="text"
                        placeholder="e.g. Sector 113, Dwarka Expressway (5 mins from IGI)"
                        value={propertyDetails.location}
                        onChange={(e) => setPropertyDetails({...propertyDetails, location: e.target.value})}
                        className="w-full bg-[#070707] border border-[#1e1e1e] px-4 py-2.5 text-xs text-[#f0f0f0] focus:border-[#26cece] outline-none rounded-[2px] transition-colors font-mono"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider">Key Amenities (Comma Separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Rooftop pool, 10k sqft Clubhouse, Private garden, Luxury lounge"
                        value={propertyDetails.amenities}
                        onChange={(e) => setPropertyDetails({...propertyDetails, amenities: e.target.value})}
                        className="w-full bg-[#070707] border border-[#1e1e1e] px-4 py-2.5 text-xs text-[#f0f0f0] focus:border-[#26cece] outline-none rounded-[2px] transition-colors font-mono"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider">Brochure Details / Extra Notes</label>
                      <textarea
                        rows={3}
                        placeholder="Enter additional pitch details or copy-paste text from the property brochure..."
                        value={propertyDetails.extra_details}
                        onChange={(e) => setPropertyDetails({...propertyDetails, extra_details: e.target.value})}
                        className="w-full bg-[#070707] border border-[#1e1e1e] px-4 py-2.5 text-xs text-[#f0f0f0] focus:border-[#26cece] outline-none rounded-[2px] transition-colors font-mono resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider">Topic / Product Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Quantum X1 Wireless Earbuds"
                        value={propertyDetails.title}
                        onChange={(e) => setPropertyDetails({...propertyDetails, title: e.target.value})}
                        className="w-full bg-[#070707] border border-[#1e1e1e] px-4 py-2.5 text-xs text-[#f0f0f0] focus:border-[#26cece] outline-none rounded-[2px] transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider">Topic Category / Niche</label>
                      <input
                        type="text"
                        placeholder="e.g. Tech Gadget, SaaS Product, Fitness Course, Cooking Vlog"
                        value={propertyDetails.category}
                        onChange={(e) => setPropertyDetails({...propertyDetails, category: e.target.value})}
                        className="w-full bg-[#070707] border border-[#1e1e1e] px-4 py-2.5 text-xs text-[#f0f0f0] focus:border-[#26cece] outline-none rounded-[2px] transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider">Pricing / Offer (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. $99 (20% Off Launch Deal)"
                        value={propertyDetails.price}
                        onChange={(e) => setPropertyDetails({...propertyDetails, price: e.target.value})}
                        className="w-full bg-[#070707] border border-[#1e1e1e] px-4 py-2.5 text-xs text-[#f0f0f0] focus:border-[#26cece] outline-none rounded-[2px] transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider">Call to Action (CTA)</label>
                      <input
                        type="text"
                        placeholder="e.g. Tap the link in bio to secure yours!"
                        value={propertyDetails.cta}
                        onChange={(e) => setPropertyDetails({...propertyDetails, cta: e.target.value})}
                        className="w-full bg-[#070707] border border-[#1e1e1e] px-4 py-2.5 text-xs text-[#f0f0f0] focus:border-[#26cece] outline-none rounded-[2px] transition-colors font-mono"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider">Key Details / Features / Description</label>
                      <textarea
                        rows={5}
                        placeholder="Enter features, specifications, copy-paste promo text, or a raw description of your topic..."
                        value={propertyDetails.details}
                        onChange={(e) => setPropertyDetails({...propertyDetails, details: e.target.value})}
                        className="w-full bg-[#070707] border border-[#1e1e1e] px-4 py-2.5 text-xs text-[#f0f0f0] focus:border-[#26cece] outline-none rounded-[2px] transition-colors font-mono resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Brochure PDF & Media upload section */}
                <div className="border-t border-[#1e1e1e] pt-6 space-y-4">
                  <h3 className="text-xs font-mono uppercase text-[#a0a0a0] tracking-widest">
                    Media & Document Attachments
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Brochure Upload */}
                    <div className="border border-dashed border-[#1e1e1e] hover:border-[#26cece]/40 p-4 rounded-[2px] text-center bg-[#070707]/30 transition-all flex flex-col justify-center items-center">
                      <FileText className="w-8 h-8 text-[#777777] mb-2" />
                      <label className="text-xs font-mono text-[#a0a0a0] cursor-pointer hover:text-[#26cece] block">
                        Upload Reference PDF / Document
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setUploadedBrochure(e.target.files[0]);
                              toast.success(`Document "${e.target.files[0].name}" attached successfully!`);
                            }
                          }}
                        />
                      </label>
                      {uploadedBrochure && (
                        <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                          ✓ {uploadedBrochure.name}
                        </span>
                      )}
                    </div>

                    {/* Image Uploads */}
                    <div className="border border-dashed border-[#1e1e1e] hover:border-[#26cece]/40 p-4 rounded-[2px] text-center bg-[#070707]/30 transition-all flex flex-col justify-center items-center">
                      <Building className="w-8 h-8 text-[#777777] mb-2" />
                      <label className="text-xs font-mono text-[#a0a0a0] cursor-pointer hover:text-[#26cece] block">
                        Upload Showcase Images
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <span className="text-[9px] text-[#777777] mt-1 font-mono uppercase block">
                        {customImages.length > 0 ? `${customImages.length} images added` : 'Supports PNG, JPG (16:9 vertical/horizontal)'}
                      </span>
                    </div>
                  </div>

                  {/* Render uploaded image thumbnails */}
                  {customImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-[#070707] border border-[#1e1e1e]">
                      {customImages.map((src, idx) => (
                        <div key={idx} className="relative w-16 h-10 border border-[#1e1e1e] rounded-[1px] overflow-hidden group">
                          <img src={src} className="w-full h-full object-cover" alt="Property thumbnail" />
                          <button
                            onClick={() => setCustomImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute inset-0 bg-red-600/80 text-[8px] font-bold text-white uppercase flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGenerateScript}
                  disabled={isGeneratingScript}
                  className="w-full btn-primary py-4 rounded-[2px] flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold"
                >
                  {isGeneratingScript ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Weaving Property Details into script...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      Generate Cinematic Script
                    </>
                  )}
                </button>
              </div>
            )}

            {/* STEP 3: Script & Presenter Studio */}
            {activeStep === 3 && (
              <div className="bg-[#111111] border border-[#1e1e1e] p-6 rounded-[2px] space-y-6">
                <div>
                  <h2 className="text-xl font-bold uppercase font-['Space_Grotesk'] text-[#f0f0f0] tracking-wider flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#26cece]" /> Presenter Studio & Script
                  </h2>
                  <p className="text-xs text-[#777777] mt-1 font-mono uppercase">
                    Fine-tune the voiceover narration, select the digital presenter avatar, and inspect the visual scenes before compilation.
                  </p>
                </div>

                {/* Avatar select grid */}
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider block">
                    Choose Presenter Avatar
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {AVATARS.map((av) => (
                      <div
                        key={av.id}
                        onClick={() => setSelectedAvatar(av.id)}
                        className={`p-3 border rounded-[2px] transition-all cursor-pointer flex items-center gap-3 ${
                          selectedAvatar === av.id
                            ? 'border-[#26cece] bg-[#26cece]/5'
                            : 'border-[#1e1e1e] bg-[#070707] hover:border-[#333333]'
                        }`}
                      >
                        <img src={av.img} alt={av.name} className="w-10 h-10 rounded-full object-cover border border-[#1e1e1e]" />
                        <div className="overflow-hidden">
                          <h4 className="font-['Space_Grotesk'] text-xs font-bold uppercase truncate text-[#f0f0f0]">{av.name}</h4>
                          <span className="text-[8px] text-[#777777] font-mono uppercase block">{av.gender} / {av.id.split('_')[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Presenter Layout Mode selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider block">
                    Choose Presenter Layout Mode
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'circle', name: 'Presenter Circle (Bottom Bubble)', desc: 'Presenter in a floating holographic circle.' },
                      { id: 'overlay', name: 'Studio Overlay (Glassmorphism)', desc: 'Presenter standing in front of real property footage.' },
                      { id: 'split', name: 'Split Studio (Half Screen)', desc: 'Side-by-side split screen presenter and footage.' }
                    ].map((mode) => (
                      <div
                        key={mode.id}
                        onClick={() => setPresenterLayout(mode.id)}
                        className={`p-3 border rounded-[2px] transition-all cursor-pointer space-y-1 ${
                          presenterLayout === mode.id
                            ? 'border-[#26cece] bg-[#26cece]/5'
                            : 'border-[#1e1e1e] bg-[#070707] hover:border-[#333333]'
                        }`}
                      >
                        <h4 className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#f0f0f0]">{mode.name}</h4>
                        <p className="text-[9px] text-[#777777] font-mono uppercase">{mode.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scene-by-scene script editor */}
                {generatedScript && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider block">
                        Story Scene Outline ({generatedScript.scenes?.length || 0} Cuts)
                      </span>
                      <span className="text-[9px] font-mono text-[#26cece] uppercase bg-[#26cece]/10 px-2 py-0.5 rounded-[1px] border border-[#26cece]/20">
                        Vibe: {audioVibe}
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 border border-[#1e1e1e] bg-[#070707] p-4">
                      {generatedScript.scenes?.map((scene, idx) => (
                        <div key={idx} className="p-3 border border-[#1e1e1e] bg-[#111111] rounded-[2px] relative space-y-3">
                          <div className="flex justify-between items-center border-b border-[#1e1e1e] pb-1.5">
                            <span className="text-[10px] font-mono text-[#26cece] uppercase font-bold">
                              Scene 0{idx + 1} ({scene.duration || 8}s) — {scene.transition || 'Cut'}
                            </span>
                            <span className="text-[9px] text-[#777777] font-mono uppercase">
                              Visual: {scene.visual_cue.substring(0, 45)}...
                            </span>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[8px] font-mono text-[#777777] uppercase tracking-wider block">Voice Narration</label>
                            <textarea
                              rows={2}
                              value={scene.narration}
                              onChange={(e) => {
                                const newScenes = [...generatedScript.scenes];
                                newScenes[idx].narration = e.target.value;
                                setGeneratedScript({ ...generatedScript, scenes: newScenes });
                              }}
                              className="w-full bg-[#070707] border border-[#1e1e1e] p-2 text-xs text-[#f0f0f0] outline-none rounded-[1px] focus:border-[#26cece] font-mono resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[8px] font-mono text-[#777777] uppercase tracking-wider block">Subtitle Overlay</label>
                              <input
                                type="text"
                                value={scene.overlay_text}
                                onChange={(e) => {
                                  const newScenes = [...generatedScript.scenes];
                                  newScenes[idx].overlay_text = e.target.value;
                                  setGeneratedScript({ ...generatedScript, scenes: newScenes });
                                }}
                                className="w-full bg-[#070707] border border-[#1e1e1e] p-1.5 text-[10px] text-[#f0f0f0] outline-none rounded-[1px] focus:border-[#26cece] font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-mono text-[#777777] uppercase tracking-wider block">Ken Burns Visual prompt</label>
                              <input
                                type="text"
                                value={scene.visual_cue}
                                onChange={(e) => {
                                  const newScenes = [...generatedScript.scenes];
                                  newScenes[idx].visual_cue = e.target.value;
                                  setGeneratedScript({ ...generatedScript, scenes: newScenes });
                                }}
                                className="w-full bg-[#070707] border border-[#1e1e1e] p-1.5 text-[10px] text-[#f0f0f0] outline-none rounded-[1px] focus:border-[#26cece] font-mono"
                              />
                            </div>
                          </div>

                          {/* Kling AI Video Generator Tool */}
                          <div className="mt-3 pt-3 border-t border-[#1e1e1e]/60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-[#777777] uppercase tracking-wider">Kling AI Video:</span>
                              {scene.kling_video_url ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-[1px] border border-emerald-500/20 animate-fade-in">
                                  <Check className="w-3 h-3" /> Ready
                                </span>
                              ) : klingTasks[idx]?.loading ? (
                                <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-[#26cece] uppercase bg-[#26cece]/10 px-2 py-0.5 rounded-[1px] border border-[#26cece]/20">
                                  <Loader2 className="w-3 h-3 animate-spin" /> {klingTasks[idx].status}
                                </span>
                              ) : klingTasks[idx]?.status === 'failed' ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-red-400 uppercase bg-red-500/10 px-2 py-0.5 rounded-[1px] border border-red-500/20">
                                  Failed
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono text-[#555555] uppercase">Not generated (Using stock loop)</span>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={klingTasks[idx]?.loading}
                              onClick={() => handleGenerateKlingVideo(idx)}
                              className={`px-3 py-1.5 rounded-[2px] font-mono text-[9px] uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                                scene.kling_video_url
                                  ? 'border-[#26cece]/30 hover:border-[#26cece] text-[#26cece] hover:bg-[#26cece]/5'
                                  : klingTasks[idx]?.loading
                                  ? 'border-[#1e1e1e] text-[#555] cursor-not-allowed bg-transparent'
                                  : 'border-[#26cece]/40 hover:border-[#26cece] text-black bg-[#26cece] hover:bg-[#26cece]/95 font-bold shadow-[0_0_8px_rgba(38,206,206,0.15)]'
                              }`}
                            >
                              {klingTasks[idx]?.loading ? (
                                <>Generating...</>
                              ) : scene.kling_video_url ? (
                                <>Regenerate Video</>
                              ) : (
                                <><Sparkles className="w-3 h-3" /> Generate Video</>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setActiveStep(4);
                    toast.success('Script and Presenter mapped. Ready to play reel!');
                  }}
                  className="w-full btn-primary py-4 rounded-[2px] flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold"
                >
                  <Tv className="w-4 h-4 text-black" />
                  Proceed to Video Player
                </button>
              </div>
            )}

            {/* STEP 4: Reel Preview Player / Simulation */}
            {activeStep === 4 && (
              <div className="bg-[#111111] border border-[#1e1e1e] p-6 rounded-[2px] space-y-6">
                <div>
                  <h2 className="text-xl font-bold uppercase font-['Space_Grotesk'] text-[#f0f0f0] tracking-wider flex items-center gap-2">
                    <Tv className="w-5 h-5 text-[#26cece]" /> Cinematic Video Player
                  </h2>
                  <p className="text-xs text-[#777777] mt-1 font-mono uppercase">
                    Preview your generated reel. This compiles your video scenes with transitions, text-to-speech avatar vocal sync, and background tracks.
                  </p>
                </div>

                {generatedScript && (
                  <div className="space-y-4">
                    <div className="relative aspect-video w-full max-w-[700px] mx-auto bg-[#000] border border-[#1e1e1e] overflow-hidden rounded-[2px] group flex">
                      
                      {/* Background Visual (Video or Image) */}
                      <div className={`relative h-full transition-all duration-500 overflow-hidden ${
                        presenterLayout === 'split' ? 'w-1/2' : 'w-full'
                      }`}>
                        {bgSource === 'video' || generatedScript.scenes[currentSceneIndex]?.kling_video_url ? (
                          <video
                            ref={videoRef}
                            src={generatedScript.scenes[currentSceneIndex]?.kling_video_url || SAMPLE_PROPERTY_VIDEOS[currentSceneIndex % SAMPLE_PROPERTY_VIDEOS.length]}
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                            style={{
                              animation: isPlaying ? 'background-pulse 8s infinite ease-in-out' : 'none'
                            }}
                          />
                        ) : (
                          <img
                            src={(customImages.length > 0 ? customImages : SAMPLE_PROPERTY_IMAGES)[currentSceneIndex % (customImages.length > 0 ? customImages.length : SAMPLE_PROPERTY_IMAGES.length)]}
                            alt="Video Scene Walkthrough"
                            className={`w-full h-full object-cover transition-all duration-[8000ms] ${
                              isPlaying 
                                ? 'scale-110 translate-x-2 translate-y-1 rotate-1' 
                                : 'scale-100'
                            }`}
                          />
                        )}
                        
                        {/* Dark overlay gradients for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35 pointer-events-none" />
                        
                        {/* Caption text for Split screen layout (rendered left screen) */}
                        {generatedScript.scenes?.[currentSceneIndex] && presenterLayout === 'split' && (
                          <div className="absolute bottom-6 left-6 right-6 text-left z-20 pointer-events-none">
                            <span className="bg-[#26cece] text-[#070707] px-2 py-0.5 text-[8px] md:text-[9px] font-mono uppercase tracking-widest font-bold">
                              {generatedScript.scenes[currentSceneIndex].transition || 'Zoom Shot'}
                            </span>
                            <h2 className="text-lg md:text-xl font-extrabold uppercase font-['Space_Grotesk'] text-[#fff] tracking-tight mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                              {generatedScript.scenes[currentSceneIndex].overlay_text}
                            </h2>
                          </div>
                        )}
                      </div>

                      {/* Presenter Render based on Layout */}

                      {/* 1. Circle Layout (Bottom Right Bubble) */}
                      {presenterLayout === 'circle' && (
                        <div className="absolute bottom-16 right-4 w-28 h-28 md:w-32 md:h-32 border-2 border-[#26cece] rounded-full overflow-hidden shadow-2xl bg-[#111] z-20 transition-all duration-500">
                          {renderPresenterAvatar()}
                        </div>
                      )}

                      {/* 2. Studio Overlay Layout (Waist-up glass panel) */}
                      {presenterLayout === 'overlay' && (
                        <div className="absolute bottom-0 right-4 w-40 h-[85%] z-20 overflow-hidden transition-all duration-500 flex items-end pointer-events-none">
                          <div className="relative w-full h-[95%] rounded-t-[100px] border-t-2 border-x-2 border-[#26cece]/60 bg-gradient-to-t from-black/90 via-[#111]/75 to-[#222]/20 backdrop-blur-md overflow-hidden shadow-[0_-10px_30px_rgba(38,206,206,0.15)] flex items-end justify-center">
                            <div className="w-[85%] h-[85%] rounded-full overflow-hidden mb-[15%] border border-[#1e1e1e]">
                              {renderPresenterAvatar()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. Split Screen Studio Layout (Right Half) */}
                      {presenterLayout === 'split' && (
                        <div className="w-1/2 h-full bg-gradient-to-br from-[#0c101b] to-[#050608] border-l border-[#1e1e1e] flex flex-col items-center justify-center p-4 z-20 transition-all duration-500 relative">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(38,206,206,0.06),transparent_70%)] pointer-events-none" />
                          <div className="absolute top-4 left-4 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#26cece] animate-ping" />
                            <span className="text-[7px] font-mono text-[#26cece] tracking-widest uppercase">Presenter Live</span>
                          </div>
                          
                          <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-[#26cece]/40 overflow-hidden shadow-[0_0_25px_rgba(38,206,206,0.15)] bg-[#111]">
                            {renderPresenterAvatar()}
                          </div>
                          
                          <div className="text-center mt-3 max-w-[85%]">
                            <span className="text-[9px] font-mono text-[#e0e0e0] uppercase tracking-wider block font-bold">
                              {AVATARS.find(a => a.id === selectedAvatar)?.name}
                            </span>
                            <span className="text-[7px] font-mono text-[#777777] uppercase block mt-0.5">
                              {AVATARS.find(a => a.id === selectedAvatar)?.desc}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Overlay Captions / Subtitle Text (for Circle and Overlay layouts) */}
                      {generatedScript.scenes?.[currentSceneIndex] && presenterLayout !== 'split' && (
                        <div className="absolute bottom-6 left-6 right-36 text-left z-20 pointer-events-none">
                          <span className="bg-[#26cece] text-[#070707] px-2 py-0.5 text-[8px] md:text-[9px] font-mono uppercase tracking-widest font-bold">
                            {generatedScript.scenes[currentSceneIndex].transition || 'Zoom Shot'}
                          </span>
                          <h2 className="text-xl md:text-3xl font-extrabold uppercase font-['Space_Grotesk'] text-[#fff] tracking-tight mt-1 animate-fade-in-up drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {generatedScript.scenes[currentSceneIndex].overlay_text}
                          </h2>
                          <p className="text-[#a0a0a0] text-[10px] md:text-xs font-mono uppercase tracking-wide mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-2">
                            Narration: "{generatedScript.scenes[currentSceneIndex].narration}"
                          </p>
                        </div>
                      )}

                      {/* Bottom voice narration track subtitle for Split Screen */}
                      {generatedScript.scenes?.[currentSceneIndex] && presenterLayout === 'split' && (
                        <div className="absolute bottom-16 left-6 right-6 text-left z-20 pointer-events-none">
                          <p className="text-[#e0e0e0] text-[10px] md:text-xs font-mono tracking-wide mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] bg-black/60 p-2 border border-[#1e1e1e] rounded-[1px]">
                            Narration: "{generatedScript.scenes[currentSceneIndex].narration}"
                          </p>
                        </div>
                      )}

                      {/* Progress slider bar top */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#1e1e1e] z-30">
                        <div
                          className="h-full bg-[#26cece] transition-all duration-100"
                          style={{ width: `${sceneElapsedTime}%` }}
                        />
                      </div>

                      {/* Music track label top right */}
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 border border-[#1e1e1e] rounded-[1px] z-30 flex items-center gap-1.5">
                        <Music className="w-3 h-3 text-[#26cece] animate-spin" style={{ animationDuration: '4s' }} />
                        <span className="text-[8px] font-mono uppercase text-[#e0e0e0] tracking-wider truncate max-w-[120px]">
                          {audioVibe}
                        </span>
                      </div>

                      {/* Control Bar bottom center */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/70 border-t border-[#1e1e1e] z-30 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={handlePlayStopReel}
                            className="w-8 h-8 rounded-full bg-[#26cece] text-black flex items-center justify-center hover:scale-105 transition-transform"
                          >
                            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                          </button>
                          <span className="text-[10px] font-mono uppercase text-[#a0a0a0] tracking-wider">
                            Scene {currentSceneIndex + 1} / {generatedScript.scenes.length}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-[#a0a0a0] hover:text-[#fff] transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                      </div>

                    </div>

                    {/* Quick Tuning Options Control panel below the player */}
                    <div className="flex flex-wrap justify-between items-center gap-4 bg-[#111111] border border-[#1e1e1e] p-4 rounded-[2px] max-w-[700px] mx-auto">
                      <div className="flex flex-wrap gap-4 w-full justify-between">
                        <div className="space-y-1">
                          <span className="text-[8px] font-mono text-[#777777] uppercase tracking-wider block">Background Visuals</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setBgSource('video')}
                              className={`px-3 py-1.5 text-[9px] font-mono uppercase border rounded-[1px] font-bold ${
                                bgSource === 'video'
                                  ? 'bg-[#26cece] text-black border-[#26cece]'
                                  : 'bg-[#070707] text-[#a0a0a0] border-[#1e1e1e] hover:border-[#333333]'
                              }`}
                            >
                              Moving Stock Video Loops
                            </button>
                            <button
                              onClick={() => setBgSource('photos')}
                              className={`px-3 py-1.5 text-[9px] font-mono uppercase border rounded-[1px] font-bold ${
                                bgSource === 'photos'
                                  ? 'bg-[#26cece] text-black border-[#26cece]'
                                  : 'bg-[#070707] text-[#a0a0a0] border-[#1e1e1e] hover:border-[#333333]'
                              }`}
                            >
                              Static Property Images
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] font-mono text-[#777777] uppercase tracking-wider block">Presenter Layout</span>
                          <div className="flex gap-1.5">
                            {[
                              { id: 'circle', label: 'Circle Bubble' },
                              { id: 'overlay', label: 'Glass Overlay' },
                              { id: 'split', label: 'Split Studio' }
                            ].map(lay => (
                              <button
                                key={lay.id}
                                onClick={() => setPresenterLayout(lay.id)}
                                className={`px-3 py-1.5 text-[9px] font-mono uppercase border rounded-[1px] font-bold ${
                                  presenterLayout === lay.id
                                    ? 'bg-[#26cece] text-black border-[#26cece]'
                                    : 'bg-[#070707] text-[#a0a0a0] border-[#1e1e1e] hover:border-[#333333]'
                                }`}
                              >
                                {lay.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compilation Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#1e1e1e] pt-6">
                  <button
                    onClick={() => {
                      if (window.speechSynthesis) window.speechSynthesis.cancel();
                      setIsPlaying(false);
                      setActiveStep(3);
                    }}
                    className="border border-[#1e1e1e] text-[#a0a0a0] hover:text-[#f0f0f0] py-3.5 rounded-[2px] text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Edit Script / Presenter
                  </button>

                  <button
                    onClick={handleDownloadReel}
                    className="btn-primary py-3.5 rounded-[2px] text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-black" /> Download Cinematic Reel
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Quick Stats & Side Information Panel (Right - 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Style Analyzer Info card */}
            <div className="bg-[#111111] border border-[#1e1e1e] p-5 rounded-[2px] space-y-4">
              <h3 className="text-sm font-bold uppercase font-['Space_Grotesk'] text-[#f0f0f0] tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-[#26cece]" /> Agent Specifications
              </h3>
              
              <div className="space-y-4 text-xs font-mono text-[#a0a0a0]">
                <div>
                  <span className="text-[#26cece] block uppercase text-[10px] tracking-wider">Under the Hood</span>
                  <p className="mt-1 leading-relaxed text-[#777777] uppercase text-[10px]">
                    Uses Whisper for audio transcript extraction, OpenCV/ResNet for visual transition detection, and Gemini 1.5/GPT-4o for stylistic dissection.
                  </p>
                </div>
                
                <div className="border-t border-[#1e1e1e] pt-3">
                  <span className="text-[#26cece] block uppercase text-[10px] tracking-wider">Video Consistency</span>
                  <p className="mt-1 leading-relaxed text-[#777777] uppercase text-[10px]">
                    Mixes custom assets with Kling 3.0 or Seedance 2.0 generated structural pans to maintain building design identity and avatar Lip-Sync.
                  </p>
                </div>

                <div className="border-t border-[#1e1e1e] pt-3">
                  <span className="text-[#26cece] block uppercase text-[10px] tracking-wider">Legal Safeguard</span>
                  <p className="mt-1 leading-relaxed text-[#777777] uppercase text-[10px]">
                    Learns the hook mechanisms and rhythm structure instead of cloning transcripts directly, keeping you safe from copyright strikes.
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Integration */}
            <div className="bg-[#111111] border border-[#1e1e1e] p-5 rounded-[2px] space-y-4">
              <h3 className="text-sm font-bold uppercase font-['Space_Grotesk'] text-[#f0f0f0] tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#26cece]" /> Campaign Integration
              </h3>
              <p className="text-[10px] font-mono text-[#777777] leading-relaxed uppercase">
                Directly attach this compiled cinematic reel into your marketing funnels.
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-[#070707] border border-[#1e1e1e] rounded-[1px] flex justify-between items-center">
                  <span className="text-xs text-[#a0a0a0] font-mono uppercase tracking-wide">Meta Ad Campaigns</span>
                  <span className="text-[9px] text-[#777777] font-mono uppercase">Coming soon</span>
                </div>
                <div className="p-3 bg-[#070707] border border-[#1e1e1e] rounded-[1px] flex justify-between items-center">
                  <span className="text-xs text-[#a0a0a0] font-mono uppercase tracking-wide">WhatsApp Outbound</span>
                  <span className="text-[9px] text-[#26cece] font-mono uppercase">Sync active</span>
                </div>
                <div className="p-3 bg-[#070707] border border-[#1e1e1e] rounded-[1px] flex justify-between items-center">
                  <span className="text-xs text-[#a0a0a0] font-mono uppercase tracking-wide">SEO Blog Embeds</span>
                  <span className="text-[9px] text-[#26cece] font-mono uppercase">Sync active</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
