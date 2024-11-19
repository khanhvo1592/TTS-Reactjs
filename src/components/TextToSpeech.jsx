import { useState, useRef, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ConvertIcon from '@mui/icons-material/Transform';
import { mockHistory } from '../mockData/historyData';
import axios from 'axios';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const speechSynthesis = window.speechSynthesis;
  const utteranceRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [voice, setVoice] = useState('hcm-diemmy');
  const [voices, setVoices] = useState([]);
  const maxCharacters = 3000;
  const [totalCharactersUsed, setTotalCharactersUsed] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add('dark', 'bg-gray-900');
    document.body.classList.add('dark', 'bg-gray-900');
    
    return () => {
      document.documentElement.classList.remove('dark', 'bg-gray-900');
      document.body.classList.remove('dark', 'bg-gray-900');
    };
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem('ttsHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!localStorage.getItem('ttsHistory')) {
      setHistory(mockHistory);
      localStorage.setItem('ttsHistory', JSON.stringify(mockHistory));
    }
  }, []);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await import('../data/voices.json');
        setVoices(response.default);
      } catch (error) {
        console.error('Có lỗi xảy ra khi tải danh sách giọng nói:', error);
      }
    };

    fetchVoices();
  }, []);

  const handleSpeak = async () => {
    if (!text) {
      alert('Vui lòng nhập văn bản trước khi phát âm');
      return;
    }

    setTotalCharactersUsed(prev => prev + text.length);

    const requestData = {
      text: text,
      voice: voice,
      speed: 1,
      tts_return_option: 3,
      token: process.env.REACT_APP_VIETTEL_TOKEN,
      without_filter: false,
    };

    try {
      const response = await axios.post('https://viettelai.vn/tts/speech_synthesis', requestData, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
      });

      const audioUrl = response.data.audio_url;
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
      };
    } catch (error) {
      console.error('Có lỗi xảy ra khi gọi API:', error);
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (!text) {
      alert('Vui lòng nhập văn bản trước khi tải xuống');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
    const audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'text-to-speech.wav';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(audioUrl);
    };

    mediaRecorder.start();
    speechSynthesis.speak(utterance);

    utterance.onend = () => {
      mediaRecorder.stop();
    };

    const newHistoryItem = {
      id: Date.now(),
      text: text,
      date: new Date().toLocaleString(),
      settings: {
        pitch: pitch,
        rate: rate,
        volume: volume
      }
    };

    setHistory(prevHistory => [...prevHistory, newHistoryItem]);
    localStorage.setItem('ttsHistory', JSON.stringify(history));
  };

  const handleDeleteHistoryItem = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('ttsHistory', JSON.stringify(updatedHistory));
  };

  const handleDownloadFromHistory = (historyItem) => {
    setText(historyItem.text);
    setPitch(historyItem.settings.pitch);
    setRate(historyItem.settings.rate);
    setVolume(historyItem.settings.volume);
    handleDownload();
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleConvert = () => {
    if (!text) {
      alert('Vui lòng nhập văn bản trước khi chuyển đổi');
      return;
    }
    
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.pitch = pitch;
    utteranceRef.current.rate = rate;
    utteranceRef.current.volume = volume;
    speechSynthesis.speak(utteranceRef.current);
    setIsPlaying(true);

    const newHistoryItem = {
      id: Date.now(),
      text: text,
      date: new Date().toLocaleString(),
      settings: { pitch, rate, volume }
    };
    setHistory(prev => [...prev, newHistoryItem]);
    localStorage.setItem('ttsHistory', JSON.stringify([...history, newHistoryItem]));
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-900">      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">
              HGTVDigital - Text to Speech
            </h1>
            <div className="flex gap-3">
              <button 
                className="p-2 rounded-full hover:bg-gray-700 text-gray-300 transition-colors"
                onClick={() => setShowHistory(!showHistory)}
                title="Xem lịch sử"
              >
                <HistoryIcon />
              </button>
              <button 
                className="p-2 rounded-full hover:bg-gray-700 text-gray-300 transition-colors"
                onClick={toggleTheme}
                title="Chuyển giao diện"
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </button>
            </div>
          </div>

          {showHistory && (
            <div className="mb-6 bg-gray-700/50 border border-gray-600 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-100">
                Lịch sử tạo audio
              </h2>
              {history.length === 0 ? (
                <p className="text-gray-400">
                  Chưa có lịch sử tạo audio
                </p>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between border-b pb-2 ${
                          darkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex-1">
                          <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-white'}`}>
                            {item.text}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(item.date).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="p-2 text-blue-500 hover:bg-gray-600/50 rounded-full"
                            onClick={() => handleDownloadFromHistory(item)}
                            title="Tải xuống"
                          >
                            <DownloadIcon />
                          </button>
                          <button
                            className="p-2 text-red-500 hover:bg-gray-600/50 rounded-full"
                            onClick={() => handleDeleteHistoryItem(item.id)}
                            title="Xóa"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-4 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNumber
                            ? 'bg-blue-500 text-white'
                            : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:bg-blue-400 hover:text-white`
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <textarea
            className="w-full h-48 p-4 bg-gray-700/50 border border-gray-600 rounded-lg 
                       resize-none mb-2 text-gray-100 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập văn bản cần chuyển đổi..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={maxCharacters}
          />
          
          <div className="text-right text-sm mb-4 text-gray-400">
            {text.length}/{maxCharacters} ký tự đã sử dụng trong lần tạo này
          </div>

          <div className="text-right text-sm mb-4 text-gray-400">
            Tổng số ký tự đã sử dụng: {totalCharactersUsed}
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-gray-200">Voice</label>
            <select className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded-lg 
                              text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}>
              {voices.map((v) => (
                <option key={v.code} value={v.code}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 text-gray-200">
                Speed: {rate}x
              </label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-200">
                Pitch: {pitch}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={handleConvert}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                         text-white rounded-lg transition-colors"
            >
              <ConvertIcon />
              <span>Chuyển đổi</span>
            </button>
            
            <button
              onClick={handleSpeak}
              className={`p-3 rounded-full ${isPlaying ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
            >
              <PlayArrowIcon />
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 
                         text-white rounded-lg transition-colors"
            >
              <DownloadIcon />
              <span>Tải xuống</span>
            </button>
          </div>

        
          <div className="flex justify-between text-sm text-gray-400">
            <span className="text-green-400">Connected</span>
            <span className="text-green-400">Số ký tự đã sử dụng: {text.length}</span>

            <span>Progress: 0%</span>
          </div>
        </div>
      </div>
    </div>
  );
}