import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ItemForm = ({ type, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    date: '',
    owner_name: '',
    owner_email: '',
    owner_phone: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = ['Electronics', 'Accessories', 'Documents', 'Clothing', 'Pets', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      if (image) {
        formDataToSend.append('image', image);
      }

      const endpoint = type === 'lost' ? '/items/lost' : '/items/found';
      const response = await axios.post(`${API}${endpoint}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(`${type === 'lost' ? 'Lost' : 'Found'} item submitted successfully!`);
      onSuccess(response.data);
    } catch (error) {
      console.error('Error submitting item:', error);
      toast.error('Failed to submit item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-none shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl" data-testid="form-title">
          Report {type === 'lost' ? 'Lost' : 'Found'} Item
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Item Title *</Label>
            <Input
              id="title"
              data-testid="input-title"
              placeholder="e.g., Black iPhone 15 Pro"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)} required>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} data-testid={`category-${cat.toLowerCase()}`}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              data-testid="input-description"
              placeholder="Provide detailed description..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                data-testid="input-location"
                placeholder="e.g., Central Park"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                data-testid="input-date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image">Upload Image</Label>
            <Input
              id="image"
              type="file"
              data-testid="input-image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3 text-gray-900">Your Contact Information</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="owner_name">Name *</Label>
                <Input
                  id="owner_name"
                  data-testid="input-owner-name"
                  placeholder="John Doe"
                  value={formData.owner_name}
                  onChange={(e) => handleChange('owner_name', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="owner_email">Email *</Label>
                <Input
                  id="owner_email"
                  type="email"
                  data-testid="input-owner-email"
                  placeholder="john@example.com"
                  value={formData.owner_email}
                  onChange={(e) => handleChange('owner_email', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="owner_phone">Phone (Optional)</Label>
                <Input
                  id="owner_phone"
                  type="tel"
                  data-testid="input-owner-phone"
                  placeholder="+1 234 567 8900"
                  value={formData.owner_phone}
                  onChange={(e) => handleChange('owner_phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 btn-primary"
              disabled={loading}
              data-testid="submit-button"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ItemForm;