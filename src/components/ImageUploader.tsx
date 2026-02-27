import { useState, useEffect } from 'react';
import { useSupabase } from './SupabaseProvider';

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const { supabase, isLoading, error: supabaseError } = useSupabase();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFileValidation(droppedFile);
    } else {
      setError('Please drop an image file');
    }
  };

  const handleFileValidation = (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleFileValidation(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!supabase) {
      setError('Supabase client is not initialized. Please try again later.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString().replace('0.', '')}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      setUploadedUrls(prev => [publicUrl, ...prev]);
      setFile(null);

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('Upload error:', error);
      setError(`Error uploading image: ${error.message || 'Please try again'}`);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy URL. Please try manually selecting and copying the text.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Initializing Supabase client...</p>
        </div>
      </div>
    );
  }

  if (supabaseError || !supabase) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center p-8">
          <div className="mb-4 text-red-500">
            {supabaseError || "Unable to initialize Supabase. Please check your configuration."}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div 
        className={`mb-8 border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="mb-4">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48" 
            aria-hidden="true"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              strokeWidth={2} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500">Upload a file</span>
              <span className="text-gray-500"> or drag and drop</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="sr-only"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
        </div>
        
        {file && (
          <div className="mt-4 text-sm text-gray-600">
            Selected: {file.name}
          </div>
        )}
        
        {error && (
          <div className="mt-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className={`mt-4 w-full py-2 px-4 rounded-md transition-colors
            ${uploading || !file 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : 'Upload Image'}
        </button>
      </div>

      {uploadedUrls.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Uploaded Images</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={url}
                      readOnly
                      className="flex-1 p-2 text-sm bg-gray-50 border border-gray-200 rounded"
                    />
                    <button
                      onClick={() => copyToClipboard(url)}
                      className="bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200"
                      title="Copy URL"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}