import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, Edit, Delete } from '@mui/icons-material';

const SkillProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    avatar: '/default-avatar.jpg',
    primarySkill: '',
    description: '',
    lookingFor: [],
    portfolio: []
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const skills = [
    'Web Development',
    'Graphic Design',
    'Content Writing',
    'Digital Marketing',
    'UI/UX Design',
    'Mobile Development',
    'Data Analysis',
    'Video Editing',
    'Social Media Management',
    'SEO Optimization'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/skill-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillChange = (event) => {
    setProfile(prev => ({
      ...prev,
      lookingFor: event.target.value
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handlePortfolioUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/skill-profile/portfolio', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfile(prev => ({
        ...prev,
        portfolio: [...prev.portfolio, {
          url: response.data.url,
          title: selectedFile.name,
          type: selectedFile.type
        }]
      }));
      setSelectedFile(null);
      setSuccess('Portfolio item uploaded successfully');
    } catch (err) {
      setError('Failed to upload portfolio item');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/skill-profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleDeletePortfolioItem = (index) => {
    setProfile(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Skill Profile
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Box position="relative">
                <Avatar
                  src={profile.avatar}
                  sx={{ width: 120, height: 120 }}
                />
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'white'
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <PhotoCamera />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Primary Skill</InputLabel>
                <Select
                  name="primarySkill"
                  value={profile.primarySkill}
                  onChange={handleInputChange}
                  label="Primary Skill"
                >
                  {skills.map(skill => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={profile.description}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Looking For</InputLabel>
                <Select
                  multiple
                  value={profile.lookingFor}
                  onChange={handleSkillChange}
                  label="Looking For"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {skills.map(skill => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Portfolio
              </Typography>
              <Box sx={{ mb: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="portfolio-upload"
                />
                <label htmlFor="portfolio-upload">
                  <Button
                    variant="contained"
                    component="span"
                    disabled={uploading}
                  >
                    Upload Portfolio Item
                  </Button>
                </label>
                {selectedFile && (
                  <Button
                    variant="contained"
                    onClick={handlePortfolioUpload}
                    sx={{ ml: 2 }}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Save'}
                  </Button>
                )}
              </Box>
              <Grid container spacing={2}>
                {profile.portfolio.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper sx={{ p: 1 }}>
                      <img
                        src={item.url}
                        alt={item.title}
                        style={{ width: '100%', height: 150, objectFit: 'cover' }}
                      />
                      <Typography variant="body2" noWrap>
                        {item.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePortfolioItem(index)}
                      >
                        <Delete />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Save Profile
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default SkillProfile; 