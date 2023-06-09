import { useEffect, useState, useCallback } from 'react';
import './App.css';
import { GuessWord } from './interfaces/GuessWord';

function App() {
  const [word, setWord] = useState('');
  const [guess, setGuess] = useState<GuessWord>([]);
  const [insertedLetter, setInsertedLetter] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [failures, setFailures] = useState(0);

  const API_KEY = import.meta.env.VITE_WORDKEY!;

  const APICALL = async () => {
    try {
      const data = await fetch('https://api.api-ninjas.com/v1/randomword', {
        method: 'GET',
        headers: {
          'X-Api-Key': API_KEY,
        },
      });

      const result = await data.json();
      if (result) setWord(result.word.toLowerCase());
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = useCallback(async () => {
    await APICALL();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (word) {
      setGuess(Array(word.length).fill(''));
    }
  }, [word, isGameOver]);

  const handleGuess = (e: HTMLInputElement) => {
    const val = e.value;
    if (val.length > 1) {
      val.substring(0, -1);
      return;
    }
    setInsertedLetter(val);
  };

  const tryGuess = () => {
    if (word.includes(insertedLetter)) {
      const newGuess = [...guess];
      const newWord = word.split('').map((w, i) => {
        if (w === insertedLetter && w !== '') {
          return (newGuess[i] = w);
        } else {
          return newGuess[i];
        }
      });
      setGuess([...newGuess]);

      if (newWord.every((g) => g !== '')) {
        setIsGameOver(true);
      }
    } else {
      const actualFailures = failures + 1;
      setFailures(actualFailures);
      if (actualFailures === 3) {
        setIsGameOver(true);
      }
    }
    setInsertedLetter('');
  };

  const restart = () => {
    setGuess([]);
    fetchData();
    setFailures(0);
    setInsertedLetter('');
    setIsGameOver(false);
  };

  return (
    <>
      {!isGameOver ? (
        <div>
          <div className='failures'>
            <p>Failures: {failures}</p>
          </div>
          <div className='headings'>
            <h1>Guess the word</h1>
            <p>Insert a letter</p>
          </div>
          <div className='input-container'>
            <input
              type='text'
              onChange={(e) => handleGuess(e.target)}
              max={1}
              min={1}
              value={insertedLetter}
            />
            {insertedLetter && <button onClick={tryGuess}>Guess</button>}
          </div>
          <div className='answer-container'>
            <p>Correct answers</p>
            <div className='words-container'>
              {guess.map((g, i) => {
                if (g === '') {
                  return (
                    <span key={i} className='empty-word'>
                      _
                    </span>
                  );
                } else {
                  return (
                    <span key={i} className='nonempty-word'>
                      {g}
                    </span>
                  );
                }
              })}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2>Game over</h2>
          {failures === 3 ? 'You lose' : 'You Win!'}
          <p>The word is {word}</p>
          <button onClick={restart}>Restart</button>
        </div>
      )}
    </>
  );
}

export default App;
