import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle, X, ChevronRight } from 'lucide-react';
import api from '../../../../api';

function FileUpload({ onUpload }) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            setSelectedFile(file);
        } else {
            alert('Please upload a CSV file');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await api.post('/analysis/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUpload(response.data);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-20 antialiased font-sans px-4">
            {/* Main Container */}
            <div className="bg-[#f5f5f7] rounded-[2.5rem] p-2 shadow-sm border border-gray-200/50">
                <div className="bg-white rounded-[2.2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-[#f5f5f7] text-black">
                            <Upload size={38} strokeWidth={1.2} />
                        </div>
                        <h2 className="text-4xl font-semibold tracking-tight text-black mb-3">
                            Dataset Analysis
                        </h2>
                        <p className="text-gray-500 text-lg font-normal max-w-xs mx-auto leading-relaxed">
                            Upload your CSV to begin generating insights.
                        </p>
                    </div>

                    {/* Interactive Drop Zone */}
                    <div
                        className={`relative group cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border rounded-[2rem] p-12 text-center
                            ${isDragging 
                                ? 'border-blue-500 bg-blue-50/30 scale-[0.98]' 
                                : 'border-gray-100 bg-[#fafafa] hover:bg-white hover:border-gray-200 hover:shadow-xl'
                            }
                            ${selectedFile ? 'border-transparent bg-[#f5f5f7]' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !selectedFile && fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {!selectedFile ? (
                            <div className="space-y-6">
                                <div className="flex justify-center opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                                    <File size={52} strokeWidth={1} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-black">Choose a file</h3>
                                    <p className="text-gray-400 mt-2 font-normal">or drag and drop it here</p>
                                </div>
                                <div className="flex items-center justify-center gap-6 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold pt-6">
                                    <span>CSV</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span>100MB LIMIT</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-4 animate-in fade-in slide-in-from-top-4 duration-700">
                                <div className="relative group/file">
                                    <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                                        <CheckCircle className="text-green-500" size={40} strokeWidth={1.5} />
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                        className="absolute -top-2 -right-2 p-2 bg-black text-white rounded-full shadow-lg opacity-0 group-hover/file:opacity-100 transition-all duration-300 hover:scale-110"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                
                                <h4 className="text-lg font-semibold text-black mb-1 truncate max-w-[240px]">
                                    {selectedFile.name}
                                </h4>
                                <p className="text-sm text-gray-400 font-medium tracking-wide">
                                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready to analyze
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className={`mt-10 overflow-hidden transition-all duration-700 ${selectedFile ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <button
                            className={`w-full py-5 px-8 rounded-2xl font-semibold text-white flex items-center justify-center gap-3 transition-all duration-500 transform
                                ${uploading 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-[#0071e3] hover:bg-[#0077ed] hover:shadow-2xl active:scale-[0.98]'
                                }`}
                            onClick={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Analyzing...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Analyze Dataset</span>
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Minimal Footer Tagline */}
            <p className="text-center mt-8 text-gray-400 text-sm font-medium tracking-tight">
                Privacy focused. Data is processed securely.
            </p>
        </div>
    );
}

export default FileUpload;