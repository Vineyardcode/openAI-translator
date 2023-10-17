import React, { useState } from 'react';
import OpenAI from 'openai';

function App() {
  const [inputJSON, setInputJSON] = useState('');
  const [translatedJSON, setTranslatedJSON] = useState('');
  const [allValues, setAllValues] = useState([]);
  const [translatedValues, setTranslatedValues] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState('en'); // Default to English
  const [targetLanguage, setTargetLanguage] = useState('cs'); // Default to Czech

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    dangerouslyAllowBrowser: true
  });

  const replaceWithNames = (data) => {
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map((item) => replaceWithNames(item));
      } else {
        const newObj = {};
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            newObj[key] = replaceWithNames(data[key]);
          }
        }
        return newObj;
      }
    } else {
      return 'name';
    }
  };

  const extractValues = (data) => {
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        data.forEach((item) => extractValues(item));
      } else {
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            extractValues(data[key]);
          }
        }
      }
    } else {
      allValues.push(data);
    }
  };

  const handleReplaceClick = () => {
    try {
      const parsedData = JSON.parse(inputJSON);
      const updatedData = replaceWithNames(parsedData);
      const updatedJSON = JSON.stringify(updatedData, null, 2);
      setTranslatedJSON(updatedJSON);

      allValues.length = 0; // Clear the array
      extractValues(parsedData);
      setAllValues([...allValues]);
    } catch (error) {
      console.error('Invalid JSON input:', error);
    }
  };

  const handleTranslateClick = async () => {
    try {
      const response = await openai.chat.completions.create({ 
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that translates values in JSON file.' },
          { role: 'user', content: `Translate the following value from ${sourceLanguage} to ${targetLanguage}:` },
          { role: 'assistant', content: `${allValues}` }, 
        ],
        max_tokens: 1000,
      });

      setTranslatedValues(response.choices[0].message.content);
    } catch (error) {
      console.error('Error translating values:', error);
    }
  };
  console.log(translatedValues);
  return (
    <div>
      <h1>JSON Translation App</h1>
      <div>
        <textarea
          placeholder="Enter JSON data here"
          value={inputJSON}
          onChange={(e) => setInputJSON(e.target.value)}
        />
      </div>
      <button onClick={handleReplaceClick}>Replace with "name"</button>
      <div>
        <label>Source Language: </label>
        <select
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="cs">Czech</option>
          {/* Add more language options here */}
        </select>
      </div>
      <div>
        <label>Target Language: </label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="cs">Czech</option>
          {/* Add more language options here */}
        </select>
      </div>
      <button onClick={handleTranslateClick}>Translate Values</button>
      {translatedJSON && (
        <div>
          <h2>Translated JSON:</h2>
          <pre>{translatedJSON}</pre>
        </div>
      )}
      {translatedValues && (
        <div>
          <h2>Translated Values:</h2>
          <pre>{translatedValues}</pre>
        </div>
      )}
    </div>
  );
}

export default App;