const { spawn } = require('child_process');
const path = require('path');

// Export async function to generate description
async function generateDescription(prompt) {
  return new Promise((resolve, reject) => {
    // Parse prompt to extract property details
    const promptLines = prompt.split('\n');
    const promptData = {};
    
    promptLines.forEach(line => {
      if (line.includes('Title:')) promptData.title = line.replace('Title:', '').trim();
      if (line.includes('Type:')) promptData.type = line.replace('Type:', '').trim();
      if (line.includes('Location:')) promptData.location = line.replace('Location:', '').trim();
      if (line.includes('Price:')) promptData.price = line.replace('Price:', '').trim();
      if (line.includes('Facilities:')) promptData.facilities = line.replace('Facilities:', '').trim();
    });

    const pythonScript = path.join(__dirname, 'ai_generator.py');
    const pythonPath = '/root/.venv/bin/python3';
    
    const childProcess = spawn(pythonPath, [pythonScript, JSON.stringify(promptData)], {
      env: { ...process.env, EMERGENT_LLM_KEY: process.env.EMERGENT_LLM_KEY }
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', stderr);
        reject(new Error(`AI generation failed: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout.trim());
        if (result.success) {
          resolve(result.description);
        } else {
          reject(new Error(result.error || 'AI generation failed'));
        }
      } catch (e) {
        console.error('Failed to parse Python output:', stdout);
        reject(new Error('Failed to parse AI response'));
      }
    });

    childProcess.on('error', (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
  });
}

// Log AI service status on startup
if (process.env.EMERGENT_LLM_KEY && process.env.EMERGENT_LLM_KEY.length > 0) {
  console.log('EMERGENT_LLM_KEY loaded: Yes - AI features enabled (Python backend)');
} else {
  console.log('EMERGENT_LLM_KEY not provided - AI features disabled');
}

module.exports = {
  generateDescription
};
