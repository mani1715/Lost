import React, { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ItemCard from '@/components/ItemCard';
import ItemForm from '@/components/ItemForm';
import ItemDetailModal from '@/components/ItemDetailModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('lost');
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('lost');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const [lostResponse, foundResponse] = await Promise.all([
        axios.get(`${API}/items/lost`),
        axios.get(`${API}/items/found`)
      ]);
      setLostItems(lostResponse.data);
      setFoundItems(foundResponse.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchItems();
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`${API}/items/${itemId}`);
      toast.success('Item deleted successfully');
      setSelectedItem(null);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const openForm = (type) => {
    setFormType(type);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-lavender-50 to-purple-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <ItemForm 
            type={formType} 
            onSuccess={handleFormSuccess} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F6FF' }}>
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#5B6CFF', fontFamily: 'Manrope' }} data-testid="app-title">
                Lost & Found
              </h1>
              <p className="text-gray-600 mt-1">Help reunite lost items with their owners</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => openForm('lost')} 
                className="btn-primary font-medium"
                data-testid="report-lost-button"
              >
                Report Lost Item
              </Button>
              <Button 
                onClick={() => openForm('found')} 
                className="btn-secondary text-white font-medium"
                data-testid="report-found-button"
              >
                Report Found Item
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-white shadow-sm" data-testid="tabs-list">
            <TabsTrigger 
              value="lost" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all"
              data-testid="tab-lost"
            >
              Lost Items ({lostItems.length})
            </TabsTrigger>
            <TabsTrigger 
              value="found" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white font-medium transition-all"
              data-testid="tab-found"
            >
              Found Items ({foundItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lost" className="fade-in">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#5B6CFF' }}></div>
              </div>
            ) : lostItems.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No lost items reported</h3>
                <p className="mt-2 text-gray-500">Be the first to report a lost item</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="lost-items-grid">
                {lostItems.map(item => (
                  <ItemCard key={item.id} item={item} onClick={setSelectedItem} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="found" className="fade-in">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#2ED3B7' }}></div>
              </div>
            ) : foundItems.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No found items reported</h3>
                <p className="mt-2 text-gray-500">Be the first to report a found item</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="found-items-grid">
                {foundItems.map(item => (
                  <ItemCard key={item.id} item={item} onClick={setSelectedItem} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Item Detail Modal */}
      <ItemDetailModal 
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;