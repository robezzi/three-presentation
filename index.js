
import React from 'react';
import { createRoot } from 'react-dom/client'; // Импортируйте createRoot
import App from './App';
import './styles.css'; // Импортируйте ваши стили, если они есть

const container = document.getElementById('root');
const root = createRoot(container); // Создайте корень

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);